import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    console.log("📌 Recibiendo imagen para generar URL temporal...");
    
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      console.error("❌ No se envió una imagen válida");
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    // Crear un nombre único para la imagen
    const fileName = `${uuidv4()}.png`;
    const filePath = path.join("/tmp", fileName);

    // Leer la imagen y guardarla temporalmente en /tmp
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Generar la URL pública con el nuevo endpoint
    const host = `https://${req.headers.get("host")}`;
    const imageUrl = `${host}/api/tmp/${fileName}`;

    console.log("✅ Imagen guardada temporalmente:", imageUrl);

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al procesar la imagen:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
