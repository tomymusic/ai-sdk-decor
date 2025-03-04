export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2023-04/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
          "Content-Type": "application/json",
        },
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
