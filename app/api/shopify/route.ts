import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("📢 [Shopify API] Iniciando solicitud para obtener productos...");

    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;

    if (!shopifyStore || !shopifyApiKey) {
      console.error("❌ [Error] Faltan variables de entorno de Shopify.");
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    console.log(`🌐 [Shopify API] Conectando a: https://${shopifyStore}/admin/api/2024-01/products.json`);

    const response = await fetch(
      `https://${shopifyStore}/admin/api/2025-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`📡 [Shopify API] Código de respuesta: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ [Shopify API] Error en la solicitud: ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch products from Shopify: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ [Shopify API] Productos obtenidos correctamente.", data);

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = (error as Error).message || "Unknown error";
    console.error("❌ [Shopify API] Error inesperado:", errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
