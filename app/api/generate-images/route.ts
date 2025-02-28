import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { readFile } from "fs/promises";
import { Replicate } from "replicate";

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser to allow formidable to handle the request
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    // Convert the request into a readable stream manually
    const buffer = await req.arrayBuffer();
    const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(Buffer.from(buffer), (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = formData;
    console.log("✅ Datos recibidos:", fields, files);

    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 });
    }

    // Read file as base64
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

      if (!response || !response.length) {
        console.error("❌ Replicate no devolvió una imagen válida");
        return new NextResponse(JSON.stringify({ error: "Failed to generate image" }), { status: 500 });
      }

      return new NextResponse(JSON.stringify({ image_url: response }), { status: 200 });
    } catch (error) {
      console.error("❌ Error al comunicarse con Replicate:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to connect to Replicate" }), { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
