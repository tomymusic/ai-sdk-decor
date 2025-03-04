import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("📢 [Shopify API] Iniciando solicitud...");

    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;

    if (!shopifyStore || !shopifyApiKey) {
      throw new Error("❌ SHOPIFY_STORE o SHOPIFY_API_KEY no están definidos en las variables de entorno.");
    }

    console.log(`🌐 Conectando a Shopify: ${shopifyStore}`);

    const response = await fetch(
      `https://${shopifyStore}/admin/api/2025-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyApiKey,
          "Content-Type": "application/json",
        } as HeadersInit,
      }
    );

    console.log(`📡 [Shopify API] Código de respuesta: ${response.status}`);

    if (!response.ok) {
      throw new Error(`❌ Error obteniendo productos de Shopify: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ [Shopify API] Productos obtenidos correctamente:", data);

    res.status(200).json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ [Shopify API] Error en la solicitud:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
