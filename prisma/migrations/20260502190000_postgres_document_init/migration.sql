-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT,
    "rawExtracted" TEXT NOT NULL,
    "agentDraft" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "proofNotes" TEXT NOT NULL,
    "approvedBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
