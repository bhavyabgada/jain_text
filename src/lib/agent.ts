import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-opus-4-7";

const SYSTEM = `You are a specialist in Jain and Indic manuscript work. Follow this pipeline in one pass:

1) TRANSCRIBE — Produce an exact, faithful representation of the source in the original scripts (Gujarati, Hindi/Devanagari, etc.). Preserve every matra, anusvara, visarga, halant, nukta, punctuation, and line breaks where meaningful. If the source mixes languages, keep that mix. If handwriting or OCR is ambiguous, still choose the best reading in the main transcription, and explain every doubt in proofreadingNotes.

2) TRANSLATE — After the transcription, provide clear English that conveys the full meaning and tone for a careful reader. Use plain, accurate English (not flowery unless the source is). Keep technical terms (e.g. jīva, ajīva, hiṁsā, mokṣa) with diacritics where helpful, with brief glosses in parentheses on first use if needed.

3) PROOFREAD — List uncertain glyphs or words, cross-outs in the original, possible alternate readings, and anything the human reviewer should verify. Be concise but complete.

Respond with JSON only (no markdown, no preamble), exactly this shape:
{"transcription": string, "translation": string, "proofreadingNotes": string}`;

export type AgentResult = {
  transcription: string;
  translation: string;
  proofreadingNotes: string;
};

function parseAgentJson(text: string): AgentResult {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const slice = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  const parsed = JSON.parse(slice) as Record<string, unknown>;

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Agent returned invalid JSON");
  }

  // Current schema
  if (
    typeof parsed.transcription === "string" &&
    typeof parsed.translation === "string" &&
    typeof parsed.proofreadingNotes === "string"
  ) {
    return {
      transcription: parsed.transcription,
      translation: parsed.translation,
      proofreadingNotes: parsed.proofreadingNotes,
    };
  }

  // Legacy single-field shape (older prompts)
  if (typeof parsed.compiledText === "string") {
    return {
      transcription: parsed.compiledText,
      translation: "",
      proofreadingNotes: typeof parsed.proofreadingNotes === "string" ? parsed.proofreadingNotes : "",
    };
  }

  throw new Error("Agent JSON must include transcription, translation, and proofreadingNotes");
}

/** Uses the Messages streaming API so long generations are allowed past the non-streaming ~10m SDK guard. */
async function streamAssistantText(
  client: Anthropic,
  model: string,
  messages: Anthropic.Messages.MessageParam[],
): Promise<string> {
  const stream = client.messages.stream({
    model,
    max_tokens: 16384,
    system: SYSTEM,
    messages,
  });
  return stream.finalText();
}

export async function runProofreadAgent(extractedText: string): Promise<AgentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const text = await streamAssistantText(client, model, [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Source material (PDF extract or noisy text). Apply TRANSCRIBE → TRANSLATE → PROOFREAD.\n\n${extractedText}`,
        },
      ],
    },
  ]);

  return parseAgentJson(text);
}

type ImagePart = { mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; base64: string };

export async function runVisionCompileAgent(parts: ImagePart[], preamble?: string): Promise<AgentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const instruction =
    preamble ??
    "Read every visible character from the attached page images. Then apply TRANSCRIBE → TRANSLATE → PROOFREAD in one JSON object.";

  const content: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: "text",
      text: `${instruction}\n\nRespond with JSON only: {"transcription": string, "translation": string, "proofreadingNotes": string}`,
    },
    ...parts.map(
      (p): Anthropic.Messages.ImageBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: p.mediaType, data: p.base64 },
      }),
    ),
  ];

  const text = await streamAssistantText(client, model, [{ role: "user", content }]);

  return parseAgentJson(text);
}
