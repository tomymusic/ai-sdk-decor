import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Recibimos ambas imágenes y la descripción de la prenda
    const { userImage, productImage, productDescription } = await req.json();
    console.log("✅ Recibido en la API:", { userImageLength: userImage?.length, productImage, productDescription });

    if (!userImage || !productImage || !productDescription) {
      console.error("❌ Faltan datos: userImage, productImage o productDescription", { userImageLength: userImage?.length, productImage, productDescription });
      return NextResponse.json({ error: "User image, product image, and product description are required" }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    // 🔥 Enviar las dos imágenes al nuevo modelo
    const prediction = await replicate.predictions.create({
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4", // Nuevo modelo dm-vton
      input: {
        human_img: `data:image/png;base64,${userImage}`, // 📸 Imagen del usuario en Base64
        garm_img: productImage,                       // 👕 Imagen del producto (URL)
        garment_des: productDescription                  // 📄 Descripción de la prenda
      },
    });

    console.log("🔍 Predicción iniciada en Replicate:", prediction);

    if (!prediction || !prediction.urls || !prediction.urls.get) {
      console.error("❌ Replicate no devolvió una URL de predicción válida", prediction);
      return NextResponse.json({ error: "Failed to initiate prediction" }, { status: 500 });
    }

    // 🔄 Esperamos la respuesta de Replicate
    let response;
    while (!response || response.status !== "succeeded") {
      await new Promise((res) => setTimeout(res, 2000)); // Esperamos 2 segundos entre cada consulta
      response = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }).then((res) => res.json());
      console.log("🔄 Estado de la predicción:", response.status);
    }

    console.log("✅ Respuesta final de Replicate:", response);

    // ✅ Verificamos si la respuesta contiene la propiedad `output`
    let finalImage: string | null = null;

    if (typeof response.output === "string") {
      finalImage = response.output; // ✅ Caso cuando `output` es una string (URL de la imagen)
    } else if (Array.isArray(response.output) && response.output.length > 0) {
      finalImage = response.output[response.output.length - 1]; // ✅ Caso cuando es un array
    }

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida", response);
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    console.log("✅ Imagen generada:", finalImage);
    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
