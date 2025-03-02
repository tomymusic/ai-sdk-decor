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

    const { imageBase64, prompt } = await req.json();
    console.log("✅ Recibido en la API:", { imageBase64Length: imageBase64?.length, prompt });

    if (!imageBase64 || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt", { imageBase64Length: imageBase64?.length, prompt });
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    // 🔥 Manteniendo el mismo flujo, pero con el nuevo modelo
    const prediction = await replicate.predictions.create({
      version: "06d6fae3b75ab68a28cd2900afa6033166910dd09fd9751047043a5bbb4c184b", // Nuevo modelo
      input: {
        prompt,
        image: `data:image/png;base64,${imageBase64}`,
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
