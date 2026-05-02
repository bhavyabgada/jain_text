import { PDFParse } from "pdf-parse";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isImageMime(mime: string): boolean {
  return IMAGE_TYPES.has(mime);
}

export function isPdfMime(mime: string): boolean {
  return mime === "application/pdf";
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy();
  }
}
