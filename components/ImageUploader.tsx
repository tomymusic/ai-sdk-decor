"use client";

import { useState } from "react";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string | null) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
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
      } else {
        console.error("❌ Error uploading image:", data.error);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full mb-4">
      <div className="rounded-xl">
        <div className="flex flex-col gap-10">
          <p className="text-base text-[#111111] font-medium text-center leading-relaxed">
            Upload a full-body photo, choose a clothing item, and let AI transform your look!
          </p>
          <div className="flex">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              // className="block w-full cursor-pointer text-sm"
              className="block w-full cursor-pointer text-sm bg-transparent border-none p-0 rounded-md text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 file:bg-[#007AFF] file:text-white file:border-none file:rounded-lg file:px-3 file:py-1.5 file:text-sm file:p-0 file:mr-4 file:hover:bg-[#005FCC] file:active:bg-[#0045A3]"
            />
          </div>
        </div>
        {loading && <p className="text-sm text-zinc-500 mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
