"use client";

import { ReactNode } from "react";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const host: string = searchParams?.get("host") ?? "";
    const apiKey: string = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";

    return (
        <AppBridgeProvider config={{ apiKey, host }}>
            <PolarisProvider i18n={{ locale: "en" }}>
                {children}
            </PolarisProvider>
        </AppBridgeProvider>
    );
}
