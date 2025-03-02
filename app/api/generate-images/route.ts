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

    // 🔥 Ejecutamos la API de Replicate con un tipo explícito
    let response: { output?: string[] } = await replicate.run(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          prompt,
          image: `data:image/png;base64,${imageBase64}`,
        },
      }
    );

    console.log("🔍 Respuesta de Replicate:", response);

    // ✅ Verificamos si la respuesta contiene la propiedad `output`
    let finalImage: string | null = null;

    if (response.output && Array.isArray(response.output) && response.output.length > 0) {
      finalImage = response.output[response.output.length - 1]; // Tomamos la última imagen generada
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
