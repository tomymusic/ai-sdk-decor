import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// 📌 Ruta para manejar tanto la subida como la entrega de imágenes
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

    // Generar la URL temporal usando el host actual
    const host = `https://${req.headers.get("host")}`;
    const imageUrl = `${host}/api/upload/${fileName}`;

    console.log("✅ Imagen guardada temporalmente:", imageUrl);

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al procesar la imagen:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 📌 Ruta dinámica para servir imágenes guardadas temporalmente
export async function GET(
  req: NextRequest, 
  context: { params?: { filename?: string } } // Se asegura de manejar los parámetros opcionales
) {
  try {
    const filename = context?.params?.filename;
    
    if (!filename) {
      console.error("❌ [Serve Image] No se proporcionó un nombre de archivo válido");
      return new NextResponse("Filename is required", { status: 400 });
    }

    const tempDir = "/tmp"; // Carpeta temporal en Vercel
    const filePath = path.join(tempDir, filename);

    console.log(`📢 [Serve Image] Buscando archivo: ${filePath}`);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error("❌ [Serve Image] Archivo no encontrado:", filePath);
      return new NextResponse("File not found", { status: 404 });
    }

    // Leer la imagen y devolverla con el header correcto
    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png", // Cambiar según el tipo de imagen
      },
    });
  } catch (error) {
    console.error("❌ [Serve Image] Error al servir la imagen:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
