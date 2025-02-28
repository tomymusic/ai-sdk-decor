import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import formidable from "formidable";
import fs from "fs/promises";

// Configurar Replicate con la API Key
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Habilitar el body parser para archivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    // Procesar el formulario
    const form = formidable({ multiples: false, keepExtensions: true });

    // Parsear la solicitud
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log("✅ Datos recibidos:", fields, files);

    // Obtener el prompt y la imagen
    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    // Leer el archivo como buffer y convertirlo a Base64
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const imageBase64 = imageBuffer.toString("base64");

    try {
      console.log("🔄 Enviando solicitud a Replicate...");
      
      const output = await replicate.run(
        "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
        {
          input: {
            prompt,
            image: `data:image/png;base64,${imageBase64}`,
          },
        }
      );

      console.log("🔍 Respuesta de Replicate:", output);

      if (!output) {
        console.error("❌ Replicate no devolvió una imagen válida");
        return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
      }

      return NextResponse.json({ image_url: output }, { status: 200 });

    } catch (error) {
      console.error("❌ Error al comunicarse con Replicate:", error);
      return NextResponse.json({ error: "Failed to connect to Replicate" }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
