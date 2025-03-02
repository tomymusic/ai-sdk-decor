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
        // ✅ Caso 1: La API devuelve una URL directa
        const data = await response.json();
        console.log("✅ Imagen recibida:", data.image_url);

        if (typeof data.image_url === "string") {
          setGeneratedImage(data.image_url);
        } else {
          throw new Error("Formato de imagen inválido");
        }
      } else if (contentType?.includes("application/octet-stream")) {
        // ✅ Caso 2: La API devuelve un Blob, lo convertimos a Base64
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          console.log("✅ Imagen convertida a Base64:", base64data);
          setGeneratedImage(base64data as string);
        };
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

        {/* ✅ Sección de comparación de imágenes */}
        {image && (
          <div className="mt-6">
            <h2 className="text-center text-lg font-semibold">Generated Image Comparison</h2>
            <div className="mt-4 w-full flex justify-center">
              
              {/* 🔍 Paso 1: Mostrar imágenes antes del slider */}
              <div className="flex flex-col items-center">
                <p className="font-semibold">Original Image</p>
                <img
                  src={image}
                  alt="Uploaded Image"
                  className="rounded-lg shadow-lg mb-4"
                  style={{ maxWidth: "600px", height: "auto" }}
                />
                
                {generatedImage && (
                  <>
                    <p className="font-semibold">Generated Image</p>
                    <img
                      src={generatedImage}
                      alt="Generated Image"
                      className="rounded-lg shadow-lg mb-4"
                      style={{ maxWidth: "600px", height: "auto" }}
                      onError={(e) => console.error("Error cargando imagen:", e)}
                    />
                  </>
                )}
              </div>

              {/* 🔥 Paso 2: Si ambas imágenes son válidas, mostrar el slider */}
              {generatedImage && (
                <div className="mt-4">
                  <CompareImage
                    leftImage={image}
                    rightImage={generatedImage}
                    sliderLineColor="#ffffff"
                    handleSize={30}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
