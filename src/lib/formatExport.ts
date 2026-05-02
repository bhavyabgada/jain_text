/** Stable printable / library view of the three-part template. */
export function buildApprovedExport(transcription: string, translation: string, proofNotes: string): string {
  const blocks = [
    "## Transcribe",
    transcription.trim() || "—",
    "",
    "## Translate",
    translation.trim() || "—",
    "",
    "## Proofread",
    proofNotes.trim() || "—",
  ];
  return blocks.join("\n");
}
