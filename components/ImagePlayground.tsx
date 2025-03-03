"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import ReactCompareImage from "react-compare-image"; // ✅ Importamos el slider
import { Suggestion } from "@/lib/suggestions";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [image, setImage] = useState<string | null>(null); // Imagen original
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

      const data = await response.json();
      console.log("✅ Imagen recibida:", data.image_url);

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
        />

        {/* ✅ Verifica si hay imagen original y generada antes de mostrar el slider */}
        {image && generatedImage && (
          <div className="mt-6">
            <h2 className="text-center text-lg font-semibold">Generated Image</h2>
            <div className="mt-4 w-full rounded-lg overflow-hidden flex justify-center">
              <ReactCompareImage
                leftImage={image} // Imagen original
                rightImage={generatedImage} // Imagen generada
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
