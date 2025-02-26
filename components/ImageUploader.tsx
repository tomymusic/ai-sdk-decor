"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Clickable Button That Opens File Picker */}
      <Button
        onClick={handleChooseFile}
        className="w-full max-w-sm bg-black text-white hover:bg-gray-800"
      >
        Choose File
      </Button>

      {preview && (
        <Card className="w-full max-w-sm">
          <CardContent className="flex justify-center p-4">
            <Image src={preview} alt="Preview" width={300} height={300} className="rounded-lg" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
