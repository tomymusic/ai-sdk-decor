"use client";

import { ReactNode, useEffect, useState } from "react";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
    const [host, setHost] = useState<string | null>(null);
    const apiKey = process.env.SHOPIFY_API_KEY || "FALLBACK_KEY";

    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const shopifyHost = searchParams.get("host");

            if (shopifyHost) {
                setHost(decodeURIComponent(shopifyHost)); // Decodificamos para evitar problemas con valores en base64
            } else {
                console.error("❌ Error: `host` no encontrado en la URL.");
            }
        }
    }, []);

    console.log("✅ Shopify API Key:", apiKey);
    console.log("✅ Shopify Host:", host || "❌ No encontrado");

    if (!host) {
        return (
            <div style={{ padding: "20px", color: "red", fontWeight: "bold", textAlign: "center" }}>
                ❌ Error: No se puede cargar la aplicación sin `host`.
            </div>
        );
    }

    return (
        <AppBridgeProvider config={{ apiKey, host }}>
            <PolarisProvider i18n={{ locale: "en" }}>
                {children}
            </PolarisProvider>
        </AppBridgeProvider>
    );
}
