import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { MODEL_CONFIGS } from "@/lib/provider-config";

const TIMEOUT_MILLIS = 55 * 1000;

// 🔥 Inicializa Replicate con el token directo (sin process.env)
const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN, // ✅ Ajustado según tu configuración
});

// Función para manejar el timeout
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis)
    ),
  ]);
};

// Función principal para manejar las solicitudes POST
export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const formData = await req.formData();
  const prompt = formData.get("prompt") as string;
  const uploadedImage = formData.get("image") as File;

  try {
    if (!prompt || !uploadedImage) {
      const error = "Invalid request parameters: both image and prompt are required";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    // Convertir imagen a Base64
    const imageArrayBuffer = await uploadedImage.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString("base64");

    // Seleccionar el modelo correcto de Replicate
    const modelId = MODEL_CONFIGS.performance.replicate;
    const startstamp = performance.now();

    // 🔥 Llamar a Replicate con el formato correcto
    const generatePromise = replicate.run(modelId, {
      input: {
        input_image: `data:image/png;base64,${imageBase64}`, // 🔥 Algunos modelos requieren "input_image"
        prompt: prompt,
      },
    }).then((output) => {
      console.log(
        `Completed image request [requestId=${requestId}, model=${modelId}, elapsed=${(
          (performance.now() - startstamp) /
          1000
        ).toFixed(1)}s].`
      );

      return {
        provider: "replicate",
        image: Array.isArray(output) ? output[0] : output, // 🔥 Ajustado según el tipo de respuesta
      };
    });

    const result = await withTimeout(generatePromise, TIMEOUT_MILLIS);
    return NextResponse.json(result, {
      status: "image" in result ? 200 : 500,
    });
  } catch (error) {
    console.error(
      `Error generating image [requestId=${requestId}, model=${modelId}]: `,
      error
    );
    return NextResponse.json(
      {
        error: "Failed to generate image. Please try again later.",
      },
      { status: 500 }
    );
  }
}
