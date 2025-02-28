import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { readFile } from "fs/promises";
import Replicate from "replicate";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Desactivar bodyParser para manejar archivos correctamente
  },
};

// ✅ Convierte `NextRequest.body` a un `Readable` Stream sin errores de tipo
function toNodeStream(req: NextRequest): Readable {
  if (!req.body) throw new Error("Request body is empty");

  const reader = req.body.getReader();
  return new Readable({
    async read() { // 🔥 Eliminamos `size` para evitar ESLint error
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });
}

// ✅ Función para parsear el formulario de manera correcta
async function parseForm(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const stream = toNodeStream(req);
    form.parse(stream, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// ✅ API Handler - Genera imágenes con Replicate
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    // ⬇ Parseamos la imagen y el prompt desde el formulario
    const { fields, files } = await parseForm(req);
    console.log("✅ Datos recibidos:", fields, files);

    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    // ⬇ Convertimos la imagen a Base64
    const imageBuffer = await readFile(imageFile.filepath);
    const imageBase64 = imageBuffer.toString("base64");

    try {
      console.log("🔄 Enviando solicitud a Replicate...");
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN!,
      });

      // ⬇ Enviamos la imagen y prompt a Replicate
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
      const finalImage = response.length > 1 ? response[1] : null;

      if (!finalImage) {
        console.error("❌ Replicate no devolvió una segunda imagen válida");
        return NextResponse.json({ error: "Failed to get output_1.png" }, { status: 500 });
      }

      return NextResponse.json({ image_url: finalImage }, { status: 200 });
    } catch (error) {
      console.error("❌ Error al comunicarse con Replicate:", error);
      return NextResponse.json({ error: "Failed to connect to Replicate" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
