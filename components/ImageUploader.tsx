"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";

export default function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [outputImage, setOutputImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("Please upload an image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await axios.post("/api/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOutputImage(response.data.image);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <label className="w-full max-w-sm">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <Button className="w-full bg-black text-white hover:bg-gray-800">
          Choose File
        </Button>
      </label>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full max-w-sm bg-black text-white hover:bg-gray-800"
      >
        {loading ? "Generating..." : "Submit"}
      </Button>

      {preview && (
        <Card className="w-full max-w-sm">
          <CardContent className="flex justify-center p-4">
            <Image src={preview} alt="Preview" width={300} height={300} className="rounded-lg" />
          </CardContent>
        </Card>
      )}

      {outputImage && (
        <Card className="w-full max-w-sm">
          <CardContent className="flex justify-center p-4">
            <Image src={outputImage} alt="Output" width={300} height={300} className="rounded-lg" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
