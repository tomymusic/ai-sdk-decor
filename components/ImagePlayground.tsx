"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { Suggestion } from "@/lib/suggestions";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [image, setImage] = useState<string | null>(null);
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

  const handleImageUpload = (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    if (reader.result) {
      setImage(reader.result as string); // ✅ Guarda la imagen correctamente
    }
  };
};

  const handleSubmit = async (prompt: string) => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }
    setIsLoading(true);

    const payload = {
      imageBase64: image,
      prompt,
    };

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }

      if (contentType?.includes("application/json")) {
        const data = await response.json();
        if (typeof data.image_url === "string") {
          setGeneratedImage(data.image_url);
        } else {
          throw new Error("Formato de imagen inválido");
        }
      } else if (contentType?.includes("application/octet-stream")) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setGeneratedImage(blobUrl);
      } else {
        throw new Error("Formato de respuesta desconocido");
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
        <ImageUploader onImageUpload={handleImageUpload} />
        <PromptInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          suggestions={suggestions}
          showProviders={showProviders}
          onToggleProviders={toggleView}
          mode={mode}
          onModeChange={handleModeChange}
        />

        {image && generatedImage && (
          <div className="mt-6 flex justify-center">
            <h2 className="text-center text-lg font-semibold">Generated Image</h2>
            <div className="w-full max-w-2xl rounded-lg overflow-hidden aspect-[3/2]">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={image} alt="Uploaded Image" style={{ objectFit: "contain", width: "100%", height: "100%" }} />}
                itemTwo={<ReactCompareSliderImage src={generatedImage} alt="Generated Image" style={{ objectFit: "contain", width: "100%", height: "100%" }} />}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
