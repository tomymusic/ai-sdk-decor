"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (base64Image: string | null) => void; // Ahora espera Base64 en lugar de File
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convertir a Base64
    const base64 = await convertFileToBase64(file);

    onImageUpload(base64);
    setPreview(URL.createObjectURL(file));
  };

  // Función para convertir un archivo a Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
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
