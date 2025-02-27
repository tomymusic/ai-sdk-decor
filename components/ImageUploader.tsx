"use client";

import { useState } from "react";

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-700">Upload an Image</label>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
      {preview && <img src={preview} alt="Preview" className="mt-4 w-40 rounded-lg" />}
    </div>
  );
}
