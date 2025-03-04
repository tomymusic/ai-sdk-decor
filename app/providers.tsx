"use client";

import { AppBridgeProvider } from "@shopify/app-bridge-react";
import { Provider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function Providers({ children }) {
    const host = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("host") : "";

    return (
        <AppBridgeProvider config={{ apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY, host }}>
            <PolarisProvider>{children}</PolarisProvider>
        </AppBridgeProvider>
    );
}
