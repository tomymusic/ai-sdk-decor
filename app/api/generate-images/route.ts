import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { readFile } from "fs/promises";
import Replicate from "replicate";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Necesario para que formidable maneje archivos
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    // ✅ Convertimos `NextRequest` en un `Readable` sin usar `any`
    const stream = Readable.from(req.body as NodeJS.ReadableStream);
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(stream, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("✅ Datos recibidos:", fields, files);

    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 });
    }

    // Leer el archivo y convertirlo en base64
    const imageBuffer = await readFile(imageFile.filepath);
    const imageBase64 = imageBuffer.toString("base64");

    try {
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

      // ✅ Solo extraemos `output_1.png`
      const finalImage = Array.isArray(response) && response.length > 1 ? response[1] : null;

      if (!finalImage) {
        console.error("❌ Replicate no devolvió una segunda imagen válida");
        return new NextResponse(JSON.stringify({ error: "Failed to get output_1.png" }), { status: 500 });
      }

      return new NextResponse(JSON.stringify({ image_url: finalImage }), { status: 200 });
    } catch (error) {
      console.error("❌ Error al comunicarse con Replicate:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to connect to Replicate" }), { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
