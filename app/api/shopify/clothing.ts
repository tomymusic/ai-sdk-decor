import { NextResponse } from "next/server";

// Función para clasificar productos automáticamente
function classifyClothing(title: string, productType: string, tags: string[]): string | null {
  console.log("📢 [ClassifyClothing] Procesando producto:", title, "|", productType, "|", tags);

  const lowerTitle = (title + " " + productType).toLowerCase();

  // Upper body (poleras, camisas, chaquetas, tops, suéteres)
  if (
    lowerTitle.includes("camisa") || lowerTitle.includes("polera") || lowerTitle.includes("chaqueta") ||
    lowerTitle.includes("top") || lowerTitle.includes("suéter") || lowerTitle.includes("sweater") ||
    lowerTitle.includes("t-shirt") || lowerTitle.includes("jersey") || lowerTitle.includes("shirt") ||
    lowerTitle.includes("jacket") || lowerTitle.includes("sweater") || lowerTitle.includes("jersey")
  ) {
    console.log("✅ Clasificado como: upper_body");
    return "upper_body";
  }
  
  // Lower body (pantalones, shorts, faldas, joggers, cargos)
  if (
    lowerTitle.includes("pantalón") || lowerTitle.includes("jeans") || lowerTitle.includes("shorts") ||
    lowerTitle.includes("falda") || lowerTitle.includes("jogger") || lowerTitle.includes("cargo") ||
    lowerTitle.includes("leggings") || lowerTitle.includes("pants") || lowerTitle.includes("shorts") ||
    lowerTitle.includes("skirt") || lowerTitle.includes("jogger") || lowerTitle.includes("cargo") ||
    lowerTitle.includes("leggings")
  ) {
    console.log("✅ Clasificado como: lower_body");
    return "lower_body";
  }

  // Dresses (vestidos, enterizos, jumpsuits, overalls)
  if (
    lowerTitle.includes("vestido") || lowerTitle.includes("enterizo") || lowerTitle.includes("jumpsuit") ||
    lowerTitle.includes("overall") || lowerTitle.includes("dress") || lowerTitle.includes("jumpsuit") ||
    lowerTitle.includes("overall")
  ) {
    console.log("✅ Clasificado como: dresses");
    return "dresses";
  }

  console.log("❌ No se clasificó en ninguna categoría");
  return null;
}

export async function GET() {
  try {
    console.log("📢 [Shopify API] Iniciando solicitud para obtener productos...");
    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;

    if (!shopifyStore || !shopifyApiKey) {
      console.error("❌ Faltan variables de entorno de Shopify");
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    console.log(`🌐 Conectando a Shopify: https://${shopifyStore}/admin/api/2025-01/products.json`);

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
      console.error(`❌ Error en la solicitud a Shopify: ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch products from Shopify" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const products = data.products;

    console.log(`📦 [Shopify API] ${products.length} productos recibidos`);

    // Filtrar y clasificar productos de ropa
    const clothingProducts = products
      .map((product) => {
        const category = classifyClothing(product.title, product.product_type, product.tags.split(", "));
        return category ? { ...product, category } : null;
      })
      .filter(Boolean); // Eliminar los null

    console.log(`🎯 [Filtrado] ${clothingProducts.length} productos clasificados correctamente`);

    return NextResponse.json(clothingProducts);
  } catch (error) {
    console.error("❌ [Shopify API] Error inesperado:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
