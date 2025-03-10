const CATEGORY_MAP: Record<string, string[]> = {
  upper_body: ["camisa", "polera", "chaqueta", "top", "suéter", "sweater", "t-shirt", "shirt", "jacket",
    "jersey", "hoodie", "parka", "camiseta", "anorak", "cazadora", "pullover", "chaquetón",
    "abrigo", "blazer", "poleron"],
  lower_body: ["pantalón", "jeans", "shorts", "falda", "jogger", "cargo", "leggings", "pants", "skirt",
    "bermuda", "bóxer", "calza", "culotte", "chandal", "trousers"],
  dresses: ["vestido", "enterizo", "jumpsuit", "overall", "dress", "mono", "pichi", "maxi vestido"]
};

// ✅ Función para obtener el Access Token
async function getAdminAccessToken(shop: string) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // ⚠️ SOLO PARA PRUEBAS, NO USAR EN PRODUCCIÓN

    console.log(`📡 Obteniendo Access Token para la tienda: ${shop}...`);
    const response = await fetch(`https://humble-doodle-r46qqxwx749p34qj-4040.app.github.dev/api/get-token?shop=${shop}`);

    if (!response.ok) throw new Error(`❌ Error HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();
    if (!data.accessToken) throw new Error("❌ Access Token no encontrado en la respuesta.");

    console.log("✅ Access Token obtenido correctamente.");
    return data.accessToken;
  } catch (error) {
    console.error("❌ Error en getAdminAccessToken:", error);
    return null;
  }
}

// ✅ Función para obtener información del producto
export async function fetchProductInfo(shopDomain: string, productId?: string, handle?: string) {
  try {
    console.log(`📡 Obteniendo información del producto para la tienda: ${shopDomain}...`);

    // Obtener el Access Token
    const accessToken = await getAdminAccessToken(shopDomain);
    if (!accessToken) {
      console.error(`❌ No se pudo obtener el Access Token para ${shopDomain}`);
      return null;
    }

    // Construcción de la URL de Shopify Remix
    const SHOPIFY_REMIX_API_URL = "https://humble-doodle-r46qqxwx749p34qj-4040.app.github.dev";
    const queryParam = productId ? `id=${productId}` : `handle=${handle}`;
    const apiUrl = `${SHOPIFY_REMIX_API_URL}/api/products?${queryParam}`;

    console.log("🔗 URL de petición a Shopify Remix:", apiUrl);

    // Realizar la petición al API de Shopify
    const response = await fetch(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`❌ Error al obtener el producto: ${response.statusText}`);

    const data = await response.json();
    console.log("✅ Producto recibido de Shopify Remix:", JSON.stringify(data, null, 2));

    // Extraer y mapear la categoría del producto
    const title = data.title || "";
    const productType = data.product_type || "";
    const combinedText = (title + " " + productType).toLowerCase();

    const category = Object.entries(CATEGORY_MAP).find(([, keywords]) =>
      keywords.some(keyword => combinedText.includes(keyword))
    )?.[0] || null;

    if (!category) {
      console.warn("⚠️ Categoría no encontrada, no se puede procesar para IA.");
      return null;
    }

    // Retornar solo los datos necesarios
    return {
      type: category, // 🔥 Categoría (upper_body, lower_body o dresses)
      image: data.featuredImage?.url || data.image_url || null, // Imagen del producto
    };

  } catch (error) {
    console.error("❌ Error en fetchProductInfo:", error);
    return null;
  }
}
