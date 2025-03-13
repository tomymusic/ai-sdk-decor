"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { Stopwatch } from "@/components/Stopwatch"; // ✅ Importamos Stopwatch
import { Suggestion } from "@/lib/suggestions";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(true);
  const [mode, setMode] = useState<"performance" | "quality">("performance");
  const [startTime, setStartTime] = useState<number | null>(null); // ✅ Nuevo estado para el tiempo de inicio

  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: "performance" | "quality") => {
    setMode(newMode);
    setShowProviders(true);
  };

  const handleImageUpload = (uploadedUrl: string | null) => {
    setImageUrl(uploadedUrl);
  };

  const handleSubmit = async (prompt: string) => {
    if (!imageUrl) {
      alert("Please upload an image.");
      return;
    }
    setIsLoading(true);
    setStartTime(Date.now()); // ✅ Guardamos el tiempo de inicio

    // 🔍 Obtener `handle` desde la URL del iframe
    const urlParams = new URLSearchParams(window.location.search);
    const handle = urlParams.get("handle");
    console.log("🔍 Handle obtenido en el frontend:", handle);

    const payload = {
      userImage: imageUrl, // ✅ Imagen del usuario
      productDescription: prompt, // ✅ Mantiene `prompt` como `productDescription`
      shop: new URL(document.referrer).hostname, // ✅ Dominio de la tienda
      handle, // ✅ Agregamos el `handle`
    };

    console.log("📌 Enviando datos al backend:", payload); // 🔥 Log agregado aquí

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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
    <div className="min-h-screen bg-background pt-8">
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

        {/* ✅ Mostrar Stopwatch mientras la imagen se genera */}
        {isLoading && startTime && (
          <div className="flex justify-center mt-4">
            <Stopwatch startTime={startTime} />
          </div>
        )}

        {imageUrl && generatedImage && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl rounded-lg overflow-hidden flex justify-center">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={imageUrl} alt="Uploaded Image" style={{ objectFit: "contain", width: "100%", height: "auto", borderRadius: "12px" }} />}
                itemTwo={<ReactCompareSliderImage src={generatedImage} alt="Generated Image" style={{ objectFit: "contain", width: "100%", height: "auto", borderRadius: "12px" }} />}
                handle={
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: "50%",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                  />
                }
                style={{ width: "100%", maxWidth: "600px", height: "auto", borderRadius: "12px", margin: "0 auto" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
