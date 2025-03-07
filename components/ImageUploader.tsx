"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string | null) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // 🚀 Upload image to Cloudinary through our API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpload(data.imageUrl);
        setPreview(data.imageUrl);
      } else {
        console.error("❌ Error uploading image:", data.error);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-700">Upload Your Photo</label>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
      {loading && <p>Uploading...</p>}
      {preview && (
        <div className="mt-4 w-40 rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" width={160} height={160} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}
