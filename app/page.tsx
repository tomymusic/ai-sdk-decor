"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [enableGeneration, setEnableGeneration] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const host = urlParams.get("host");

      if (host) {
        router.replace(`/?host=${host}`);
      } else {
        console.error("⚠️ No se encontró 'host' en la URL, evitando redirección inválida.");
      }
    }
  }, [router]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Configuración de AI SDK Decor</h1>
      <label>
        API Key:
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </label>

      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={enableGeneration}
          onChange={(e) => setEnableGeneration(e.target.checked)}
        />
        Habilitar Generación de Imágenes
      </label>

      <button
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
        onClick={() => alert("⚡ Configuración guardada")}
      >
        Guardar Configuración
      </button>
    </div>
  );
}
