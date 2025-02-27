import { NextRequest, NextResponse } from "next/server";
import * as formidable from "formidable";
import fs from "fs";
import { Readable } from "stream";
import { IncomingMessage } from "http";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const form = new formidable.IncomingForm();

  // Convert NextRequest to an IncomingMessage
  const reqBody = await req.arrayBuffer();
  const stream = Readable.from(Buffer.from(reqBody));
  const incomingReq = Object.assign(new IncomingMessage(null as unknown as import("net").Socket), {
    headers: req.headers,
    url: req.url,
    method: req.method,
    socket: null,
    pipe: stream.pipe.bind(stream),
  });

  return new Promise((resolve) => {
    form.parse(incomingReq, async (err, fields, files) => {
      if (err) {
        resolve(new NextResponse(JSON.stringify({ error: "Error parsing form data" }), { status: 500 }));
        return;
      }

      console.log("Solicitud recibida en la API");
      console.log("Prompt:", fields.prompt);
      console.log("Archivos recibidos:", files);

      const prompt = fields.prompt?.[0] || "";
      const imageFile = files.image?.[0];

      if (!imageFile || !prompt) {
        resolve(new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 }));
        return;
      }

      const imageBuffer = fs.readFileSync(imageFile.filepath);
      const imageBase64 = imageBuffer.toString("base64");

      try {
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
        console.log("Respuesta de Replicate:", data);
        resolve(new NextResponse(JSON.stringify({ image_url: data.output }), { status: 200 }));
      } catch {
        resolve(new NextResponse(JSON.stringify({ error: "Failed to generate image" }), { status: 500 }));
      }
    });
  });
}
