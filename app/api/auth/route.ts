import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES!;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL!;

export async function GET(req: NextRequest) {
    console.log("🚀 [AUTH START] - Incoming auth request");

    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");

    console.log("🔍 Received shop param:", shop);

    if (!shop) {
        console.error("❌ Missing shop parameter");
        return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    }

    if (!SHOPIFY_API_KEY || !SHOPIFY_SCOPES || !SHOPIFY_APP_URL) {
        console.error("❌ Missing environment variables:", {
            SHOPIFY_API_KEY,
            SHOPIFY_SCOPES,
            SHOPIFY_APP_URL,
        });
        return NextResponse.json({ error: "Server misconfiguration: missing environment variables" }, { status: 500 });
    }

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${SHOPIFY_APP_URL}/api/auth/callback`;

    console.log("🔄 Redirecting to Shopify Auth:", authUrl);

    return NextResponse.redirect(authUrl);
}
