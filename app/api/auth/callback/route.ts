import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

export async function GET(req: NextRequest) {
    console.log("🚀 [AUTH CALLBACK] - Request received");

    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const code = url.searchParams.get("code");
    const hmac = url.searchParams.get("hmac");

    console.log("🔍 Query Params:", { shop, code, hmac });

    if (!shop || !code || !hmac) {
        console.error("❌ Missing parameters", { shop, code, hmac });
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verificar HMAC (seguridad)
    const params = new URLSearchParams(url.searchParams);
    params.delete("hmac");
    const sortedParams = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const calculatedHmac = crypto
        .createHmac("sha256", SHOPIFY_API_SECRET)
        .update(new URLSearchParams(sortedParams).toString())
        .digest("hex");

    console.log("🔑 Calculated HMAC:", calculatedHmac);
    console.log("🔑 Received HMAC:", hmac);

    if (calculatedHmac !== hmac) {
        console.error("❌ HMAC validation failed");
        return NextResponse.json({ error: "HMAC validation failed" }, { status: 400 });
    }

    // Intercambiar el código por un Access Token
    console.log("🔄 Fetching Access Token...");
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET,
            code,
        }),
    });

    const data = await response.json();
    console.log("🔑 Access Token Response:", data);

    if (!response.ok) {
        console.error("❌ Failed to get access token", data);
        return NextResponse.json({ error: "Failed to get access token" }, { status: 400 });
    }

    const accessToken = data.access_token;

    console.log("✅ Authentication successful! Access Token received.");

    return NextResponse.json({ success: true, access_token: accessToken });
}
