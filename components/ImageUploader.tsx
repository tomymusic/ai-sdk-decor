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
    <div className="w-full mb-8">
      <div className="bg-background rounded-xl p-4 border border-border">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            Upload a full-body photo, choose a clothing item, and let AI transform your look!
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block cursor-pointer text-sm bg-background border border-border p-2 rounded-md text-foreground focus:ring-2 focus:ring-ring file:bg-primary file:text-primary-foreground file:border-none file:rounded-md file:px-4 file:py-2 file:text-sm"
            />
          </div>
        </div>
        {loading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
