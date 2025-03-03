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
  const [imageURL, setImageURL] = useState<string | null>(null); // URL de la imagen subida para el slider
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

  // ✅ Extraemos correctamente la imagen subida y la convertimos a una URL usable
  const handleImageUpload = (imgBase64: string | null) => {
    if (!imgBase64) return;
    console.log("✅ Imagen subida por el usuario:", imgBase64);
    setImage(imgBase64);

    // Convertimos la imagen base64 a una URL usable para el slider
    const blob = fetch(imgBase64)
      .then((res) => res.blob())
      .then((blob) => URL.createObjectURL(blob));
    
    blob.then((url) => {
      console.log("✅ URL de imagen para slider:", url);
      setImageURL(url);
    });
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

        {/* ✅ Sección del slider (se coloca en la misma ubicación que la imagen generada) */}
        {imageURL && generatedImage && (
          <div className="mt-6 w-full flex justify-center">
            <CompareImage
              leftImage={imageURL} // ✅ URL de la imagen original en formato usable
              rightImage={generatedImage} // ✅ Imagen generada
              leftImageAlt="Original Image"
              rightImageAlt="Generated Image"
              sliderLineColor="#ffffff"
              handleSize={30}
            />
          </div>
        )}

        {/* ✅ Imagen generada se muestra en su posición original */}
        {generatedImage && (
          <div className="mt-6">
            <h2 className="text-center text-lg font-semibold">Generated Image</h2>
            <div className="mt-4 w-full rounded-lg overflow-hidden flex justify-center">
              <Image
                src={generatedImage}
                alt="Generated"
                width={600}
                height={400}
                className="rounded-lg"
                unoptimized={true} // ✅ Evita problemas con imágenes externas o Blob URLs
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
