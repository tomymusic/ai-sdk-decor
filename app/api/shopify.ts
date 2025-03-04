import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;

    if (!shopifyStore || !shopifyApiKey) {
      throw new Error("SHOPIFY_STORE o SHOPIFY_API_KEY no están definidos en las variables de entorno.");
    }

    const response = await fetch(
      `https://${shopifyStore}/admin/api/2025-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyApiKey,
          "Content-Type": "application/json",
        } as HeadersInit, // 👈 Esto evita el error de TypeScript
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo productos de Shopify");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
