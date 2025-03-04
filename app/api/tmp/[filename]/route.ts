import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RequestContext } from "next/dist/server/web/spec-extension/request";

export async function GET(req: NextRequest, context: RequestContext) {
  try {
    const { filename } = context.params as { filename?: string };

    if (!filename) {
      console.error("❌ [Serve Image] No se proporcionó un nombre de archivo válido");
      return new NextResponse("Filename is required", { status: 400 });
    }

    const filePath = path.join("/tmp", filename);

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
        "Content-Type": "image/png", // Ajustar según el tipo de imagen
      },
    });
  } catch (error) {
    console.error("❌ [Serve Image] Error al servir la imagen:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
