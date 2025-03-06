"use client";

import { ReactNode, useEffect, useState } from "react";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
    const [host, setHost] = useState<string>("");
    const apiKey = process.env.SHOPIFY_API_KEY || "FALLBACK_KEY";

    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const shopifyHost = searchParams.get("host");

            if (shopifyHost) {
                setHost(shopifyHost);
            } else {
                console.warn("⚠️ Advertencia: No se encontró `host` en la URL.");
            }
        }
    }, []);

    console.log("✅ Shopify API Key:", apiKey);
    console.log("✅ Shopify Host:", host);

    if (!host || !apiKey) {
        return <div>⚠️ Error: No se puede cargar la aplicación sin `host` y `API Key`.</div>;
    }

    return (
        <AppBridgeProvider config={{ apiKey, host }}>
            <PolarisProvider i18n={{ locale: "en" }}>
                {children}
            </PolarisProvider>
        </AppBridgeProvider>
    );
}
