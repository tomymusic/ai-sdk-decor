"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput"; // ✅ IMPORTACIÓN FIJA
import {
  MODEL_CONFIGS,
  PROVIDER_ORDER,
  ProviderKey,
} from "@/lib/provider-config";
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
  } = useImageGeneration(); // 🔥 Eliminado `images`, `timings`, `failedProviders`

  const [selectedModels, setSelectedModels] = useState<
    Record<ProviderKey, string>
  >(MODEL_CONFIGS.performance);

  const handlePromptSubmit = (newPrompt: string) => {
    const activeProviders = PROVIDER_ORDER;
    if (activeProviders.length > 0) {
      startGeneration(newPrompt, activeProviders, { replicate: selectedModels.replicate });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          showProviders={false} 
          onToggleProviders={() => {}} 
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
