/**
 * Embedding service for hybrid search — fully local ONNX inference
 *
 * Uses Xenova/clip-vit-base-patch32 for both text and image embeddings.
 * Runs entirely on CPU via @huggingface/transformers (ONNX Runtime).
 * No API keys or network calls required for embedding generation.
 *
 * Note: Text encoder is English-only (original CLIP tokenizer).
 * Thai product names are indexed alongside their English names to ensure coverage.
 */

const CLIP_MODEL = "Xenova/clip-vit-base-patch32";

// Embedding dimension for CLIP ViT-B/32
export const EMBEDDING_DIM = 512;

// Cache model instances to avoid reloading on every call
let _textModel: any = null;
let _visionModel: any = null;
let _processor: any = null;
let _tokenizer: any = null;

async function getModels() {
  if (_textModel && _visionModel && _processor && _tokenizer) {
    return { textModel: _textModel, visionModel: _visionModel, processor: _processor, tokenizer: _tokenizer };
  }

  const {
    AutoProcessor,
    AutoTokenizer,
    CLIPTextModelWithProjection,
    CLIPVisionModelWithProjection,
  } = await import("@huggingface/transformers");

  const [tokenizer, processor, textModel, visionModel] = await Promise.all([
    AutoTokenizer.from_pretrained(CLIP_MODEL),
    AutoProcessor.from_pretrained(CLIP_MODEL),
    CLIPTextModelWithProjection.from_pretrained(CLIP_MODEL),
    CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL),
  ]);

  _tokenizer = tokenizer;
  _processor = processor;
  _textModel = textModel;
  _visionModel = visionModel;

  return { textModel, visionModel, processor, tokenizer };
}

/**
 * Generate text embedding using local CLIP text encoder (ONNX)
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
  const { textModel, tokenizer } = await getModels();

  const textInputs = tokenizer(text, { padding: true, truncation: true });
  const output = await textModel(textInputs);
  const embedding = Array.from(output.text_embeds.data as Float32Array);

  return normalizeVector(embedding);
}

/**
 * Generate image embedding using local CLIP vision encoder (ONNX)
 */
export async function getImageEmbedding(imageBuffer: Buffer): Promise<number[]> {
  const { RawImage } = await import("@huggingface/transformers");
  const { visionModel, processor } = await getModels();

  // Convert buffer to RawImage
  const arrayBuffer = imageBuffer.buffer.slice(
    imageBuffer.byteOffset,
    imageBuffer.byteOffset + imageBuffer.byteLength
  ) as ArrayBuffer;
  const image = await RawImage.fromBlob(new Blob([arrayBuffer]));

  const imageInputs = await processor(image);
  const output = await visionModel(imageInputs);
  const embedding = Array.from(output.image_embeds.data as Float32Array);

  if (embedding.length !== EMBEDDING_DIM) {
    throw new Error(
      `Image embedding dimension mismatch: got ${embedding.length}, expected ${EMBEDDING_DIM}. Output keys: ${Object.keys(output)}, image_embeds dims: ${output.image_embeds.dims}`
    );
  }

  return normalizeVector(embedding);
}

/**
 * Generate a combined text embedding for a product (for indexing).
 * Since CLIP text encoder is English-only, we prioritize English name
 * but include Thai name for transliterated/borrowed words (e.g. "โค้ก" won't help,
 * but "Coke Zero beverages" will produce a meaningful embedding).
 */
export function buildProductText(product: {
  name: string;
  name_th: string;
  description?: string | null;
  category: string;
}): string {
  const parts = [product.name, product.category];
  if (product.description) {
    parts.push(product.description);
  }
  return parts.join(", ");
}

/**
 * L2-normalize a vector (required for cosine similarity with CLIP)
 */
function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}
