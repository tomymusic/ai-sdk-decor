const CATEGORY_MAP: Record<string, string[]> = {
  "upper_body": ["camisa", "polera", "chaqueta", "top", "suéter", "sweater", "t-shirt", "shirt", "jacket",
      "jersey", "hoodie", "parka", "camiseta", "anorak", "cazadora", "pullover", "chaquetón",
      "abrigo", "blazer", "poleron"],
  "lower_body": ["pantalón", "jeans", "shorts", "falda", "jogger", "cargo", "leggings", "pants", "skirt",
      "bermuda", "bóxer", "calza", "culotte", "chandal", "trousers"],
  "dresses": ["vestido", "enterizo", "jumpsuit", "overall", "dress", "mono", "pichi", "maxi vestido"]
};

export async function fetchProductInfo(shopDomain: string, productId?: string, handle?: string) {
  try {
    console.log("📡 Obteniendo información del producto desde Shopify Remix...");

    // ✅ Construir la URL con `id` o `handle`
    const queryParam = productId ? `id=${productId}` : `handle=${handle}`;
    const response = await fetch(
      `https://${shopDomain}/api/products?${queryParam}`
    );

    if (!response.ok) {
      throw new Error(`❌ Error al obtener el producto: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Producto recibido de Shopify Remix:", data);

    // 🔥 Extraer y mapear la categoría del producto
    const category = Object.entries(CATEGORY_MAP).find(([, keywords]) =>
      keywords.some(keyword => (data.title + " " + data.product_type).toLowerCase().includes(keyword))
    )?.[0] || null;

    if (!category) {
      console.warn("⚠️ Categoría del producto no es válida para el modelo de IA.");
      return null;
    }

    // ✅ Retornar solo los datos necesarios
    return {
      type: category, // 🔥 upper_body, lower_body o dresses
      image: data.featuredImage?.url || data.image_url, // URL de la imagen del producto
    };

  } catch (error) {
    console.error("❌ Error en fetchProductInfo:", error);
    return null;
  }
}
