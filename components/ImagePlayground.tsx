"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import Image from "next/image";
import { Suggestion } from "@/lib/suggestions";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(true);
  const [mode, setMode] = useState<"performance" | "quality">("performance");

  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: "performance" | "quality") => {
    setMode(newMode);
    setShowProviders(true);
  };

  const handleSubmit = async (prompt: string) => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", prompt);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setGeneratedImage(data.image_url);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <ImageUploader onImageUpload={setImage} />
        <PromptInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          suggestions={suggestions}
          showProviders={showProviders}
          onToggleProviders={toggleView}
          mode={mode}
          onModeChange={handleModeChange}
        />
        {generatedImage && (
          <div className="mt-6">
            <h2 className="text-center text-lg font-semibold">Generated Image</h2>
            <div className="mt-4 w-full rounded-lg overflow-hidden">
              <Image src={generatedImage} alt="Generated" width={600} height={400} className="rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
