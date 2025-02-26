import { ImagePlayground } from "@/components/ImagePlayground";
import { getRandomSuggestions } from "@/lib/suggestions";
import ImageUploader from "@/components/ImageUploader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div>
      <ImageUploader />  {/* Agregamos el componente de subida de imágenes */}
      <ImagePlayground suggestions={getRandomSuggestions()} />
    </div>
  );
}
