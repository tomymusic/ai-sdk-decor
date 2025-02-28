import { NextRequest, NextResponse } from "next/server";
import { IncomingMessage } from "http";
import formidable from "formidable";
import fs from "fs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📌 API recibió una solicitud");

    const form = new formidable.IncomingForm();

    return new Promise((resolve) => {
      form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
        if (err) {
          console.error("❌ Error al analizar el formulario:", err);
          resolve(new NextResponse(JSON.stringify({ error: "Error parsing form data" }), { status: 500 }));
          return;
        }

        console.log("✅ Datos recibidos:", fields, files);

        const prompt = fields.prompt?.[0] || "";
        const imageFile = files.image?.[0];

        if (!imageFile || !prompt) {
          console.error("❌ Faltan datos: Image o Prompt");
          resolve(new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 }));
          return;
        }

        const imageBuffer = fs.readFileSync(imageFile.filepath);
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
            resolve(new NextResponse(JSON.stringify({ error: "Failed to generate image" }), { status: 500 }));
            return;
          }

          resolve(new NextResponse(JSON.stringify({ image_url: data.output }), { status: 200 }));
        } catch (error) {
          console.error("❌ Error al comunicarse con Replicate:", error);
          resolve(new NextResponse(JSON.stringify({ error: "Failed to connect to Replicate" }), { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
