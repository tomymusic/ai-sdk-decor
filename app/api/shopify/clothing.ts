import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyStore || !shopifyAccessToken) {
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://${shopifyStore}/admin/api/2024-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
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
    
    // Filtrar solo productos de ropa (puedes cambiar el filtro según tus datos en Shopify)
    const clothingProducts = data.products.filter((product: any) =>
      product.product_type.toLowerCase().includes("ropa") ||
      product.product_type.toLowerCase().includes("shirt") ||
      product.product_type.toLowerCase().includes("t-shirt") ||
      product.product_type.toLowerCase().includes("pants")
    );

    return NextResponse.json({ products: clothingProducts });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
