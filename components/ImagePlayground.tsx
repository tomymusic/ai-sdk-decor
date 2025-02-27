"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { PROVIDER_ORDER } from "@/lib/provider-config";
import { Suggestion } from "@/lib/suggestions";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { Header } from "./Header";

export function ImagePlayground({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const {
    isLoading,
    startGeneration,
    activePrompt,
  } = useImageGeneration();

  const handlePromptSubmit = (newPrompt: string) => {
    if (PROVIDER_ORDER.length > 0) {
      startGeneration(newPrompt);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          suggestions={suggestions}
        />
        {activePrompt && (
          <div className="text-center mt-4 text-muted-foreground">
            {activePrompt}
          </div>
        )}
      </div>
    </div>
  );
}
