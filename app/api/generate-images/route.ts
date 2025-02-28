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

    if (!imageBase64 || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    const response = await replicate.run(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          prompt,
          image: `data:image/png;base64,${imageBase64}`,
        },
      }
    );

    console.log("🔍 Respuesta de Replicate:", response);

    // ✅ Verificamos si la respuesta es un array antes de acceder a índices
    let finalImage: string | null = null;

    if (Array.isArray(response) && response.length > 1) {
      finalImage = response[1]; // Tomamos el segundo output
    } else if (Array.isArray(response) && response.length === 1) {
      finalImage = response[0]; // Si solo hay un output, usamos el primero
    } else if (typeof response === "string") {
      finalImage = response; // Si la respuesta es un string, lo usamos directamente
    }

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
