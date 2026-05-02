-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT,
    "rawExtracted" TEXT NOT NULL,
    "agentDraft" TEXT NOT NULL,
    "approvedBody" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
