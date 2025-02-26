"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Input"; // Verifica que la importación sea correcta
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";

export default function ImageUploader() {
  const [textPrompt, setTextPrompt] = useState<string>("");
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
    if (!selectedImage && !textPrompt) {
      alert("Please enter a prompt or upload an image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    if (selectedImage) formData.append("image", selectedImage);
    if (textPrompt) formData.append("prompt", textPrompt);

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
    <div className="p-4 space-y-4">
      <Input
        type="text"
        placeholder="Enter text prompt"
        value={textPrompt}
        onChange={(e) => setTextPrompt(e.target.value)}
      />
      <Input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && (
        <Card>
          <CardContent>
            <Image src={preview} alt="Preview" width={500} height={500} />
          </CardContent>
        </Card>
      )}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Submit"}
      </Button>
      {outputImage && (
        <Card>
          <CardContent>
            <Image src={outputImage} alt="Output" width={500} height={500} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
