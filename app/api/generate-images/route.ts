import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises"; // Usa fs/promises para manejar archivos asincrónicamente.

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    const form = formidable({
      multiples: false, // Solo se permite subir una imagen.
      keepExtensions: true, // Mantiene la extensión original del archivo.
    });

    // ✅ Forma moderna de parsear el formulario en Next.js 15
    const [fields, files] = await form.parse(req);

    console.log("✅ Datos recibidos:", fields, files);

    const prompt = fields.prompt?.[0] || "";
    const imageFile = files.image?.[0];

    if (!imageFile || !prompt) {
      console.error("❌ Faltan datos: Image o Prompt");
      return new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 });
    }

    // Leer el archivo como buffer y convertirlo a Base64
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
