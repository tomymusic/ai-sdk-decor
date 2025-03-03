"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import Image from "next/image";
import CompareImage from "react-compare-image";
import { Suggestion } from "@/lib/suggestions";

interface ImagePlaygroundProps {
  suggestions?: Suggestion[];
}

export function ImagePlayground({ suggestions = [] }: ImagePlaygroundProps) {
  const [image, setImage] = useState<string | null>(null); // Imagen subida por el usuario
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // Imagen generada por la API
  const [showProviders, setShowProviders] = useState(true);
  const [mode, setMode] = useState<"performance" | "quality">("performance");

  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: "performance" | "quality") => {
    setMode(newMode);
    setShowProviders(true);
  };

  // ✅ Asegura que la imagen subida se guarda bien
  const handleImageUpload = (imgBase64: string | null) => {
    if (!imgBase64) return;
    console.log("✅ Imagen subida por el usuario:", imgBase64);
    setImage(imgBase64);
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
        console.log("✅ Imagen generada recibida:", data.image_url);

        if (typeof data.image_url === "string") {
          setGeneratedImage(data.image_url);
        } else {
          throw new Error("Formato de imagen inválido");
        }
      } else if (contentType?.includes("application/octet-stream")) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log("✅ Imagen generada convertida a Blob URL:", blobUrl);
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

        {/* ✅ El slider SIEMPRE está visible porque siempre habrá imágenes */}
        <div className="mt-6 w-full flex justify-center">
          <CompareImage
            leftImage={image || "/placeholder.jpg"} // Si no hay imagen aún, carga un placeholder temporal.
            rightImage={generatedImage || "/placeholder.jpg"}
            leftImageAlt="Original Image"
            rightImageAlt="Generated Image"
            sliderLineColor="#ffffff"
            handleSize={30}
          />
        </div>

        {/* ✅ Mantiene la imagen generada en el mismo lugar de antes */}
        <div className="mt-6">
          <h2 className="text-center text-lg font-semibold">Generated Image</h2>
          <div className="mt-4 w-full rounded-lg overflow-hidden flex justify-center">
            <Image
              src={generatedImage || "/placeholder.jpg"}
              alt="Generated"
              width={600}
              height={400}
              className="rounded-lg"
              unoptimized={true} // ✅ Evita problemas con imágenes externas o Blob URLs
            />
          </div>
        </div>
      </div>
    </div>
  );
}
