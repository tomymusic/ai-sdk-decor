const CATEGORY_MAP: Record<string, string[]> = {
  "upper_body": ["camisa", "polera", "chaqueta", "top", "suéter", "sweater", "t-shirt", "shirt", "jacket",
      "jersey", "hoodie", "parka", "camiseta", "anorak", "cazadora", "pullover", "chaquetón",
      "abrigo", "blazer", "poleron"],
  "lower_body": ["pantalón", "jeans", "shorts", "falda", "jogger", "cargo", "leggings", "pants", "skirt",
      "bermuda", "bóxer", "calza", "culotte", "chandal", "trousers"],
  "dresses": ["vestido", "enterizo", "jumpsuit", "overall", "dress", "mono", "pichi", "maxi vestido"]
};

// ✅ Función para obtener el accessToken desde Shopify Remix
async function getAdminAccessToken(shop: string) {
  try {
    console.log("📡 Obteniendo Access Token desde Shopify Remix...");
    const response = await fetch(`https://humble-doodle-r46qqxwx749p34qj-4040.app.github.dev/api/get-token?shop=${shop}`);

    if (!response.ok) {
      throw new Error(`❌ Error al obtener el accessToken: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.accessToken) {
      throw new Error("❌ No se encontró accessToken en la respuesta.");
    }

    console.log("✅ Access Token obtenido correctamente.");
    return data.accessToken;
  } catch (error) {
    console.error("❌ Error en getAdminAccessToken:", error);
    return null;
  }
}

export async function fetchProductInfo(shopDomain: string, productId?: string, handle?: string) {
  try {
    console.log("📡 Obteniendo información del producto desde Shopify Remix...");

    // ✅ Obtener el accessToken desde Shopify Remix
    const accessToken = await getAdminAccessToken(shopDomain);
    if (!accessToken) {
      throw new Error(`❌ No se pudo obtener el Access Token para la tienda: ${shopDomain}`);
    }

    // ✅ Usar la URL correcta de la API de Shopify Remix
    const SHOPIFY_REMIX_API_URL = "https://humble-doodle-r46qqxwx749p34qj-4040.app.github.dev"; // 🔥 Cambio mínimo aquí

    // ✅ Construir la URL con `id` o `handle`
    const queryParam = productId ? `id=${productId}` : `handle=${handle}`;
    const apiUrl = `${SHOPIFY_REMIX_API_URL}/api/products?${queryParam}`;

    console.log("🔗 URL de la petición a Shopify Remix:", apiUrl); // 🔥 Log de la URL

    // ✅ Hacer la petición a Shopify Remix con el token correcto
    const response = await fetch(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken, // ✅ Usamos el token obtenido
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`❌ Error al obtener el producto: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Producto recibido de Shopify Remix:", data); // 🔥 Log de la respuesta de Shopify

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
