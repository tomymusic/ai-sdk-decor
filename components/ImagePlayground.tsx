"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import CompareImage from "react-compare-image";
import { Suggestion } from "@/lib/suggestions";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(true);
  const [mode, setMode] = useState<"performance" | "quality">("performance");

  const toggleView = () => setShowProviders((prev) => !prev);
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

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image, prompt }),
      });

      if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

      const data = await response.json();
      if (typeof data.image_url === "string") {
        setGeneratedImage(data.image_url);
      } else {
        throw new Error("Formato de imagen inválido");
      }
    } catch (error) {
      console.error("Error generando imagen:", error);
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

        {image && (
          <div className="mt-6">
            <h2 className="text-center text-lg font-semibold">Generated Image Comparison</h2>
            <div className="mt-4 w-full flex justify-center">
              {!generatedImage ? (
                <img
                  src={image}
                  alt="Uploaded Image"
                  className="rounded-lg shadow-lg"
                  style={{ maxWidth: "600px", height: "auto" }}
                />
              ) : (
                <CompareImage
                  leftImage={image}
                  rightImage={generatedImage}
                  sliderLineColor="#ffffff"
                  handleSize={30}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
