import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf, isImageMime, isPdfMime } from "@/lib/extract";
import { runProofreadAgent, runVisionCompileAgent } from "@/lib/agent";

/** Long Opus runs; streaming avoids Anthropic SDK non-streaming limits. Raise on Vercel if your plan allows. */
export const maxDuration = 800;

type VisionMedia = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function toVisionMediaType(mime: string): VisionMedia | null {
  if (mime === "image/jpeg" || mime === "image/png" || mime === "image/gif" || mime === "image/webp") {
    return mime;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const entries = form.getAll("files");
    const files = entries.filter((e): e is File => e instanceof File && e.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Add at least one PDF or image file." }, { status: 400 });
    }

    const pdfChunks: string[] = [];
    const imageParts: { mediaType: VisionMedia; base64: string }[] = [];
    const names: string[] = [];

    for (const file of files) {
      names.push(file.name);
      const buf = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "application/octet-stream";

      if (isPdfMime(mime)) {
        const text = await extractTextFromPdf(buf);
        pdfChunks.push(`--- ${file.name} ---\n${text}`);
      } else if (isImageMime(mime)) {
        const mediaType = toVisionMediaType(mime);
        if (!mediaType) {
          return NextResponse.json({ error: `Unsupported image type: ${mime}` }, { status: 400 });
        }
        imageParts.push({ mediaType, base64: buf.toString("base64") });
      } else {
        return NextResponse.json({ error: `Unsupported file type for ${file.name}: ${mime}` }, { status: 400 });
      }
    }

    const combinedPdfText = pdfChunks.join("\n\n").trim();
    let agentResult;

    if (imageParts.length > 0) {
      const preamble =
        combinedPdfText.length > 0
          ? `The following text was extracted from uploaded PDFs (may be incomplete if pages are scanned images). Merge and reconcile with the attached page images.\n\n${combinedPdfText}\n\n---`
          : "Transcribe and compile from the attached images only.";
      agentResult = await runVisionCompileAgent(imageParts, preamble);
    } else {
      if (!combinedPdfText) {
        return NextResponse.json(
          { error: "No text could be extracted from the PDFs. Try uploading clear images of each page instead." },
          { status: 422 },
        );
      }
      agentResult = await runProofreadAgent(combinedPdfText);
    }

    return NextResponse.json({
      originalFileNames: names,
      rawExtracted: combinedPdfText || "(images only — see compiled draft)",
      ...agentResult,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
