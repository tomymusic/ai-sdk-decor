"use client";

import { ReactNode } from "react";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
    const host = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("host") || "" : "";

    return (
        <AppBridgeProvider config={{ apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY, host }}>
            <PolarisProvider>
                {children}
            </PolarisProvider>
        </AppBridgeProvider>
    );
}
