import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> } // 🔥 SOLUCIÓN AQUÍ
) {
  try {
    const filename = context.params.filename;

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
    const fileBuffer = fs.readFileSync(filePath);
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
