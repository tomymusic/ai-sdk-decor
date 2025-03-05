"use client";

import { ImagePlayground } from "@/components/ImagePlayground";
import { getRandomSuggestions } from "@/lib/suggestions";

export default function ProductPage() {
  return <ImagePlayground suggestions={getRandomSuggestions()} />;
}
