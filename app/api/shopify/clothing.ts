import { NextResponse } from "next/server";

// Función para clasificar productos automáticamente
function classifyClothing(title: string, productType: string, tags: string[]): string | null {
  const lowerTitle = (title + " " + productType).toLowerCase();
  const lowerTags = tags.map(tag => tag.toLowerCase());

  // Upper body (poleras, camisas, chaquetas, tops, suéteres)
  if (
    lowerTitle.includes("camisa") || lowerTitle.includes("polera") || lowerTitle.includes("chaqueta") ||
    lowerTitle.includes("top") || lowerTitle.includes("suéter") || lowerTitle.includes("sweater") ||
    lowerTitle.includes("t-shirt") || lowerTitle.includes("jersey") || lowerTitle.includes("shirt") ||
    lowerTitle.includes("jacket") || lowerTitle.includes("sweater") || lowerTitle.includes("jersey")
  ) {
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
    return "lower_body";
  }

  // Dresses (vestidos, enterizos, jumpsuits, overalls)
  if (
    lowerTitle.includes("vestido") || lowerTitle.includes("enterizo") || lowerTitle.includes("jumpsuit") ||
    lowerTitle.includes("overall") || lowerTitle.includes("dress") || lowerTitle.includes("jumpsuit") ||
    lowerTitle.includes("overall")
  ) {
    return "dresses";
  }

  // Si no coincide, devolver null
  return null;
}

export async function GET() {
  try {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;

    if (!shopifyStore || !shopifyApiKey) {
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://${shopifyStore}/admin/api/2025-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch products from Shopify" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const products = data.products;

    // Filtrar y clasificar productos de ropa
    const clothingProducts = products
      .map((product: any) => {
        const category = classifyClothing(product.title, product.product_type, product.tags.split(", "));
        return category ? { ...product, category } : null;
      })
      .filter(Boolean); // Eliminar los null

    return NextResponse.json(clothingProducts);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
