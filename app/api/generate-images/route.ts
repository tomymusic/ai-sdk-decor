import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { fetchProductInfo } from "@/utils/fetchProductInfo"; // ✅ Cambio a "@"

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Obtener `handle` desde el body o la URL si no está presente
    const { userImage, shop, handle: bodyHandle, productDescription } = await req.json();
    const urlHandle = new URL(req.url).searchParams.get("handle");
    const handle = bodyHandle || urlHandle; // 🔥 Toma el `handle` desde el body o la URL

    console.log("✅ Recibido en la API:", {
      userImageLength: userImage?.length,
      shop,
      handle,
      productDescription,
    });

    if (!userImage || !shop || !handle || !productDescription) {
      console.error("❌ Faltan datos: userImage, shop, handle o productDescription");
      return NextResponse.json(
        { error: "User image, shop, handle, and product description are required" },
        { status: 400 }
      );
    }

    // 🔄 Obtener la imagen y la categoría del producto desde Shopify Remix
    console.log("🔄 Llamando a fetchProductInfo con:", { shop, handle });
    const productInfo = await fetchProductInfo(shop, handle);

    console.log("🔍 Respuesta de fetchProductInfo:", productInfo);

    if (!productInfo) {
      console.error("❌ Error al obtener el producto o categoría no válida.");
      return NextResponse.json({ error: "Product not found or category unsupported" }, { status: 404 });
    }

    const { image: productImage, type: productCategory } = productInfo;
    console.log("✅ Producto obtenido:", { productImage, productCategory });

    // 🔥 Asegurar que la categoría es válida
    if (!["upper_body", "lower_body", "dresses"].includes(productCategory)) {
      console.error("❌ Error: Categoría no compatible con el modelo de IA.");
      return NextResponse.json({ error: "Product category is not supported." }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    const prediction = await replicate.predictions.create({
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      input: {
        human_img: userImage,
        garm_img: productImage,
        garment_des: productDescription,
        category: productCategory,
        crop: true,
        seed: 42,
        steps: 30,
        force_dc: false,
        mask_only: false,
      },
    });

    console.log("🔍 Predicción iniciada en Replicate:", prediction);

    if (!prediction || !prediction.urls || !prediction.urls.get) {
      console.error("❌ Replicate no devolvió una URL válida", prediction);
      return NextResponse.json({ error: "Failed to initiate prediction" }, { status: 500 });
    }

    // 🔄 Esperamos la respuesta de Replicate
    let response;
    while (!response || response.status !== "succeeded") {
      await new Promise((res) => setTimeout(res, 2000));
      response = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }).then((res) => res.json());
      console.log("🔄 Estado de la predicción:", response.status);
    }

    console.log("✅ Respuesta final de Replicate:", response);

    let finalImage: string | null = null;

    if (typeof response.output === "string") {
      finalImage = response.output;
    } else if (Array.isArray(response.output) && response.output.length > 0) {
      finalImage = response.output[response.output.length - 1];
    }

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida", response);
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    console.log("✅ Imagen generada:", finalImage);
    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
