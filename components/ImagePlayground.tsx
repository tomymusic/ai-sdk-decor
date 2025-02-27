"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import {
  PROVIDER_ORDER,
  ProviderKey,
  initializeProviderRecord,
} from "@/lib/provider-config";
import { Suggestion } from "@/lib/suggestions";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { Header } from "./Header";

export function ImagePlayground({ suggestions }: { suggestions: Suggestion[] }) {
  const {
    images,
    isLoading,
    startGeneration,
    activePrompt,
  } = useImageGeneration();

  const [showProviders, setShowProviders] = useState(true);
  const [enabledProviders, setEnabledProviders] = useState(initializeProviderRecord(true));

  const toggleView = () => setShowProviders((prev) => !prev);

  const handleProviderToggle = (provider: string, enabled: boolean) => {
    setEnabledProviders((prev) => ({ ...prev, [provider]: enabled }));
  };

  const handlePromptSubmit = (newPrompt: string) => {
    const activeProviders = PROVIDER_ORDER.filter((p) => enabledProviders[p]);
    if (activeProviders.length > 0) {
      startGeneration(newPrompt, activeProviders, {});
    }
    setShowProviders(false);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          showProviders={showProviders}
          onToggleProviders={toggleView}
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
