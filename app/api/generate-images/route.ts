import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { readFile } from "fs/promises";
import Replicate from "replicate";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Desactiva el bodyParser para manejar archivos correctamente
  },
};

// ✅ Función para convertir `NextRequest` en `Readable` sin `any`
async function toNodeStream(req: NextRequest): Promise<Readable> {
  const buffers: Buffer[] = [];
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Request body is empty");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffers.push(Buffer.from(value));
  }

  return Readable.from(Buffer.concat(buffers));
}

// ✅ Función para parsear el formulario sin `any`
async function parseForm(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    toNodeStream(req)
      .then((stream) => {
        form.parse(stream, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      })
      .catch(reject);
  });
}

// ✅ API Handler
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    const { fields, files } = await parseForm(req);
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

      // ✅ Extraemos `output_1.png`
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
