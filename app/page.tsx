"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlayground } from "@/components/ImagePlayground";
import { getRandomSuggestions } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const host = urlParams.get("host");

      if (host) {
        router.replace(`/?host=${host}`);
      }
    }
  }, [router]); // ✅ Agregamos `router` a las dependencias

  return <ImagePlayground suggestions={getRandomSuggestions()} />;
}
