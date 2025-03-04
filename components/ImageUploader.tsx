"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string | null) => void; // Ahora espera una URL en lugar de Base64
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Subir imagen al backend en lugar de convertirla a Base64
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading image");
      }

      const data = await response.json();
      onImageUpload(data.imageUrl); // Enviamos la URL al parent
      setPreview(data.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-700">Upload an Image</label>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
      {preview && (
        <div className="mt-4 w-40 rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" width={160} height={160} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}
