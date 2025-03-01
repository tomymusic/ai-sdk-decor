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

    let response = await replicate.run(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          prompt,
          image: `data:image/png;base64,${imageBase64}`,
        },
      }
    );

    console.log("🔍 Respuesta de Replicate antes de procesar:", response);

    // 🔥 **Convertir `ReadableStream` a JSON si es necesario**
    if (response instanceof ReadableStream) {
      const reader = response.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += decoder.decode(value, { stream: true });
      }

      console.log("📜 Respuesta de Replicate decodificada:", responseText);
      response = JSON.parse(responseText);
    }

    console.log("🔍 Respuesta final de Replicate:", response);

    // ✅ **Extraer correctamente la imagen generada**
    let finalImage: string | null = null;

    if (Array.isArray(response) && response.length > 1) {
      finalImage = response[1]; // Tomamos la segunda imagen si existe
    } else if (Array.isArray(response) && response.length === 1) {
      finalImage = response[0]; // Si hay solo una imagen, usamos la primera
    } else if (typeof response === "string") {
      finalImage = response; // Si la API responde con una URL directa
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
