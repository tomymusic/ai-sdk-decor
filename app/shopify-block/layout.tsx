"use client";

import { useSearchParams } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";

  return isEmbedded ? <>{children}</> : <div className="page-container">{children}</div>;
}
