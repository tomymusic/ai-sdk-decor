import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { fetchProductInfo } from "../../../utils/fetchProductInfo";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Recibimos la imagen del usuario + datos del producto
    const { userImage, shop, productId, handle } = await req.json();
    console.log("✅ Recibido en la API:", { userImageLength: userImage?.length, shop, productId, handle });

    if (!userImage || !shop || (!productId && !handle)) {
      console.error("❌ Faltan datos: userImage, shop, productId o handle");
      return NextResponse.json({ error: "User image, shop, and product ID or handle are required" }, { status: 400 });
    }

    // 🔄 Obtener la imagen y la categoría del producto desde Shopify Remix
    console.log("🔄 Buscando producto en Shopify Remix...");
    const productInfo = await fetchProductInfo(shop, productId, handle);

    if (!productInfo) {
      console.error("❌ Error al obtener el producto o categoría no válida.");
      return NextResponse.json({ error: "Product not found or category unsupported" }, { status: 404 });
    }

    const { image: productImage, type: productCategory } = productInfo;

    console.log("✅ Producto obtenido:", { productImage, productCategory });

    // 🔥 Asegurar que la categoría es válida
    if (!["upper_body", "lower_body", "dresses"].includes(productCategory)) {
      console.error("❌ Error: Categoría no compatible con el modelo de IA.");
      return NextResponse.json({ error: "Product category is not supported." }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    // 🔥 Enviar imágenes al modelo de Replicate AI
    const prediction = await replicate.predictions.create({
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4", // Modelo dm-vton
      input: {
        human_img: userImage,                         // 📸 Imagen del usuario (URL)
        garm_img: productImage,                       // 👕 Imagen del producto (URL)
        garment_des: productDescription,              // 📄 Descripción de la prenda
        category: productCategory,                    // 🏷️ upper_body, lower_body, dresses
        crop: true,                                   // ✂️ Activamos crop por defecto
        seed: 42,                                     // 🌱 Fijamos la semilla en 42
        steps: 30,                                    // 🔄 Número de pasos de inferencia
        force_dc: false,                              // ❌ No activamos DressCode (excepto en dresses)
        mask_only: false                              // ❌ No queremos solo la máscara, queremos la imagen final
      },
    });

    console.log("🔍 Predicción iniciada en Replicate:", prediction);

    if (!prediction || !prediction.urls || !prediction.urls.get) {
      console.error("❌ Replicate no devolvió una URL válida", prediction);
      return NextResponse.json({ error: "Failed to initiate prediction" }, { status: 500 });
    }

    // 🔄 Esperamos la respuesta de Replicate
    let response;
    while (!response || response.status !== "succeeded") {
      await new Promise((res) => setTimeout(res, 2000)); // Esperar 2 segundos entre consultas
      response = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }).then((res) => res.json());
      console.log("🔄 Estado de la predicción:", response.status);
    }

    console.log("✅ Respuesta final de Replicate:", response);

    // ✅ Verificar si la respuesta contiene la imagen generada
    let finalImage: string | null = null;

    if (typeof response.output === "string") {
      finalImage = response.output; // ✅ Caso cuando output es una string (URL de la imagen)
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
