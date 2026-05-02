/*
  Warnings:

  - Added the required column `proofNotes` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcription` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT,
    "rawExtracted" TEXT NOT NULL,
    "agentDraft" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "proofNotes" TEXT NOT NULL,
    "approvedBody" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Document" ("agentDraft", "approvedAt", "approvedBody", "createdAt", "id", "originalFileName", "rawExtracted", "title") SELECT "agentDraft", "approvedAt", "approvedBody", "createdAt", "id", "originalFileName", "rawExtracted", "title" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
