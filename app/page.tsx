import { ImagePlayground } from "@/components/ImagePlayground";
import { getRandomSuggestions } from "@/lib/suggestions";
import ImageUploader from "@/components/ImageUploader";

export const dynamic = "force-dynamic";

export default function Page() {
  const suggestions = getRandomSuggestions(); // Llamamos la función una sola vez

  return (
    <div>
      <ImageUploader />
      <ImagePlayground key={JSON.stringify(suggestions)} suggestions={suggestions} />
    </div>
  );
}
