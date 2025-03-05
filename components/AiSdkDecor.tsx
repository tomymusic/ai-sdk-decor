"use client";

import { useState } from "react";
import Image from "next/image";

export default function AiSdkDecor({ productId, imageUrl }: { productId: string; imageUrl: string }) {
    const [userImage, setUserImage] = useState<File | null>(null);
    const [aiResult, setAiResult] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUserImage(event.target.files[0]);
        }
    };

    const handleApplyAI = async () => {
        if (!userImage) return;
        const formData = new FormData();
        formData.append("productImage", imageUrl);
        formData.append("userImage", userImage);

        const response = await fetch("/api/apply-ai", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        setAiResult(data.result);
    };

    return (
        <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
            <h2>AI SDK Decor</h2>
            <p>Producto ID: {productId}</p>
            <p>Imagen del Producto:</p>
            <Image 
                src={imageUrl} 
                alt="Producto" 
                width={200} 
                height={200} 
                priority
            />

            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleApplyAI}>Aplicar IA</button>

            {aiResult && (
                <Image 
                    src={aiResult} 
                    alt="AI Result" 
                    width={200} 
                    height={200} 
                />
            )}
        </div>
    );
}
