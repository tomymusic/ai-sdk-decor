export default function ImageUploader() {
  
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDisplay } from "./ImageDisplay";
import { GeneratedImage, ImageError, ProviderTiming } from "@/lib/image-types";

interface ImageGeneratorProps {
  images: GeneratedImage[];
  errors: ImageError[];
  timings: Record<string, ProviderTiming>;
  toggleView: () => void;
}

export function ImageGenerator({ images, errors, timings, toggleView }: ImageGeneratorProps) {
  // Buscar la imagen generada por Replicate
  const replicateImage = images.find((img) => img.provider === "replicate");

  return (
    <div className="space-y-6">
      {/* Renderizar errores si hay */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors[0].message}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Generated Image</h3>
        <Button variant="outline" onClick={toggleView} size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Mostrar solo la imagen generada por Replicate */}
      {replicateImage ? (
        <ImageDisplay
          provider="replicate"
          image={replicateImage.image}
          timing={timings["replicate"]}
          failed={false}
          enabled={true}
          modelId={replicateImage.modelId}
        />
      ) : (
        <p className="text-center text-gray-500">No image generated yet.</p>
      )}
    </div>
  );
}
