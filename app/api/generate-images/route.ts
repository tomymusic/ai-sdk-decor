import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import fs from "fs/promises";

// 🔄 Parsea el formulario con formidable (Sin IncomingMessage)
async function parseFormData(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise(async (resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });

    // 📌 Convertimos `NextRequest` a `Blob` y lo pasamos como stream a formidable
    const blob = await req.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    form.parse(buffer, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Parsea el formulario correctamente
    const { fields, files } = await parseFormData(req);
    console.log("✅ Datos recibidos:", fields, files);

    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 });
    }

    // 📷 Convierte la imagen a Base64
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const imageBase64 = imageBuffer.toString("base64");

    try {
      console.log("🔄 Enviando solicitud a Replicate...");
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
          input: {
            prompt,
            image: `data:image/png;base64,${imageBase64}`,
          },
        }),
      });

      const data = await response.json();
      console.log("🔍 Respuesta de Replicate:", data);

      if (!data.output) {
        console.error("❌ Replicate no devolvió una imagen válida");
        return new NextResponse(JSON.stringify({ error: "Failed to generate image" }), { status: 500 });
      }

      return new NextResponse(JSON.stringify({ image_url: data.output }), { status: 200 });
    } catch (error) {
      console.error("❌ Error al comunicarse con Replicate:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to connect to Replicate" }), { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
