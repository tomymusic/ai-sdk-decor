import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false, // ❌ Desactivamos el bodyParser
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Extraemos el JSON con la imagen en base64 y el prompt
    const { imageBase64, prompt } = await req.json();

    if (!imageBase64 || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    const response = await replicate.run<string[]>(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          prompt,
          image: `data:image/png;base64,${imageBase64}`,
        },
      }
    );

    console.log("🔍 Respuesta de Replicate:", response);

    // ✅ Extraemos `output_1.png`
    const finalImage = response.length > 1 ? response[1] : response[0];

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida");
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
