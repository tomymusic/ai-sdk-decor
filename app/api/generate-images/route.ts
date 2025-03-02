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

    // 🔥 Ejecutamos la API de Replicate
    const prediction = await replicate.run(
      "lucataco/sdxl-controlnet:06d6fae3b75ab68a28cd2900afa6033166910dd09fd9751047043a5bbb4c184b",
      {
        input: {
          prompt,
          image: `data:image/png;base64,${imageBase64}`,
        },
      }
    );

    console.log("🔍 Predicción iniciada en Replicate:", prediction);

    if (!prediction || typeof prediction !== "object") {
      console.error("❌ Respuesta inválida de Replicate", prediction);
      return NextResponse.json({ error: "Failed to get prediction response" }, { status: 500 });
    }

    // ✅ Si la respuesta es un ReadableStream, la procesamos
    if (prediction instanceof ReadableStream) {
      console.log("📜 Decodificando ReadableStream...");
      const reader = prediction.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += decoder.decode(value, { stream: true });
      }

      console.log("📜 Respuesta de Replicate decodificada:", responseText);
      prediction = JSON.parse(responseText);
    }

    console.log("✅ Respuesta final de Replicate:", prediction);

    // ✅ Manejar diferentes estructuras de salida
    let finalImage: string | null = null;

    if (typeof prediction.output === "string") {
      finalImage = prediction.output; // ✅ Caso cuando `output` es una string (URL de la imagen)
    } else if (Array.isArray(prediction.output) && prediction.output.length > 0) {
      finalImage = prediction.output[prediction.output.length - 1]; // ✅ Caso cuando es un array
    }

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida", prediction);
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    console.log("✅ Imagen generada:", finalImage);
    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
