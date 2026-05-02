import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildApprovedExport } from "@/lib/formatExport";

export async function GET() {
  const rows = await prisma.document.findMany({
    orderBy: { approvedAt: "desc" },
    select: {
      id: true,
      title: true,
      originalFileName: true,
      createdAt: true,
      approvedAt: true,
    },
  });
  return NextResponse.json({ documents: rows });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      transcription?: string;
      translation?: string;
      proofNotes?: string;
      /** Legacy single body */
      approvedBody?: string;
      rawExtracted?: string;
      agentDraft?: string;
      originalFileName?: string;
    };

    const title = body.title?.trim();
    let transcription = body.transcription?.trim() ?? "";
    const translation = body.translation?.trim() ?? "";
    const proofNotes = body.proofNotes?.trim() ?? "";
    const rawExtracted = body.rawExtracted ?? "";
    const agentDraft = body.agentDraft ?? "";

    if (!title) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }

    if (!transcription && body.approvedBody?.trim()) {
      transcription = body.approvedBody.trim();
    }

    if (!transcription || !translation) {
      return NextResponse.json(
        { error: "transcription and translation are required (use the three-part template)." },
        { status: 400 },
      );
    }

    const approvedBody = buildApprovedExport(transcription, translation, proofNotes);

    const doc = await prisma.document.create({
      data: {
        title,
        transcription,
        translation,
        proofNotes,
        approvedBody,
        rawExtracted,
        agentDraft,
        originalFileName: body.originalFileName?.slice(0, 512) ?? null,
      },
    });

    return NextResponse.json({ id: doc.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
