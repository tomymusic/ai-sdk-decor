import { NextRequest, NextResponse } from "next/server";
import { ImageModel, experimental_generateImage as generateImage } from "ai";
import { replicate } from "@ai-sdk/replicate";
import { ProviderKey } from "@/lib/provider-config";

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

const DEFAULT_IMAGE_SIZE = "1024x1024";

interface ProviderConfig {
  createImageModel: (modelId: string) => ImageModel;
  dimensionFormat: "size";
}

const providerConfig: Record<ProviderKey, ProviderConfig> = {
  replicate: {
    createImageModel: replicate.image,
    dimensionFormat: "size",
  },
};

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

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const formData = await req.formData();
  const prompt = formData.get("prompt") as string;
  const uploadedImage = formData.get("image") as File;
  const modelId = formData.get("modelId") as string;
  
  try {
    if (!prompt || !uploadedImage) {
      const error = "Invalid request parameters";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const config = providerConfig["replicate"];
    const startstamp = performance.now();
    const generatePromise = generateImage({
      model: config.createImageModel(modelId),
      prompt,
      input_image: uploadedImage,
      size: DEFAULT_IMAGE_SIZE,
      seed: Math.floor(Math.random() * 1000000),
    }).then(({ image, warnings }) => {
      if (warnings?.length > 0) {
        console.warn(
          `Warnings [requestId=${requestId}, model=${modelId}]: `,
          warnings
        );
      }
      console.log(
        `Completed image request [requestId=${requestId}, model=${modelId}, elapsed=${(
          (performance.now() - startstamp) /
          1000
        ).toFixed(1)}s].`
      );

      return {
        provider: "replicate",
        image: image.base64,
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
