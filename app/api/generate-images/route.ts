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

    // ✅ **Asegurar que la respuesta sea una URL válida**
    let finalImage: string | null = null;

    if (Array.isArray(response) && response.length > 0) {
      finalImage = response.find((url) => typeof url === "string") || null;
    } else if (typeof response === "string") {
      finalImage = response;
    }

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida");
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    console.log("✅ Imagen final enviada:", finalImage);
    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
