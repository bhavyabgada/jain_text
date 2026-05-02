"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { IndicEditor } from "@/components/IndicEditor";
import { TemplateCard } from "@/components/TemplateCard";

type Step = "upload" | "proof" | "saved";

type ProcessResponse = {
  originalFileNames: string[];
  rawExtracted: string;
  transcription: string;
  translation: string;
  proofreadingNotes: string;
};

const steps: { id: Step; n: number; label: string }[] = [
  { id: "upload", n: 1, label: "Upload" },
  { id: "proof", n: 2, label: "Review template" },
  { id: "saved", n: 3, label: "Saved" },
];

function stepIndex(s: Step): number {
  if (s === "upload") return 0;
  if (s === "proof") return 1;
  return 2;
}

export function PipelineApp() {
  const [step, setStep] = useState<Step>("upload");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [rawExtracted, setRawExtracted] = useState("");
  const [baseline, setBaseline] = useState({ transcription: "", translation: "", proofreadingNotes: "" });
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [title, setTitle] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  const onSubmitFiles = useCallback(async (fd: FormData) => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/process", { method: "POST", body: fd });
      const data = (await res.json()) as ProcessResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      setFileNames(data.originalFileNames);
      setRawExtracted(data.rawExtracted);
      const b = {
        transcription: data.transcription,
        translation: data.translation,
        proofreadingNotes: data.proofreadingNotes,
      };
      setBaseline(b);
      setTranscription(data.transcription);
      setTranslation(data.translation);
      setProofNotes(data.proofreadingNotes);
      setTitle(data.originalFileNames[0]?.replace(/\.[^.]+$/, "") || "Untitled");
      setStep("proof");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }, []);

  const onApprove = useCallback(async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          transcription: transcription.trim(),
          translation: translation.trim(),
          proofNotes: proofNotes.trim(),
          rawExtracted,
          agentDraft: JSON.stringify(baseline),
          originalFileName: fileNames.join(", "),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      setSavedId(data.id ?? null);
      setStep("saved");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }, [baseline, fileNames, proofNotes, rawExtracted, title, transcription, translation]);

  const activeIdx = stepIndex(step);

  return (
    <div className="min-h-full bg-gradient-to-b from-stone-100 via-amber-50/35 to-stone-200/80 dark:from-zinc-950 dark:via-stone-950 dark:to-zinc-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-14">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/90 dark:text-amber-400/90">
              Jain Text
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
              Transcribe / Translate / Proofread
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
              Upload PDFs or page images. Claude Opus fills a three-part template: exact Indic transcription, English
              sense, and reviewer notes. You refine and approve to your library.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-stone-300/90 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-800 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Library
          </Link>
        </header>

        <nav
          aria-label="Progress"
          className="rounded-2xl border border-stone-200/80 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <ol className="flex items-center gap-2">
            {steps.map((s, i) => {
              const done = activeIdx > i;
              const here = step === s.id;
              return (
                <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2">
                  {i > 0 ? (
                    <div
                      className={`hidden h-0.5 w-4 shrink-0 sm:block ${done ? "bg-amber-500" : "bg-stone-200 dark:bg-zinc-700"}`}
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 sm:px-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                        done || here
                          ? "bg-amber-600 text-white shadow-md shadow-amber-900/15 dark:bg-amber-500"
                          : "border border-stone-300 bg-stone-100 text-stone-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                      } ${here ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-white dark:ring-amber-600 dark:ring-offset-zinc-900" : ""}`}
                    >
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-medium ${done || here ? "text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-zinc-500"}`}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {err ? (
          <div className="rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            {err}
          </div>
        ) : null}

        {step === "upload" ? (
          <section>
            <form
              className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 p-8 shadow-lg shadow-stone-900/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void onSubmitFiles(fd);
              }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-400/15 blur-2xl dark:bg-amber-500/10" />
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Source files</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                PDF (text layer) or images — JPEG, PNG, WebP, GIF. For handwritten or scanned pages, prefer clear photos.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <input
                  name="files"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  required
                  className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white file:shadow hover:file:bg-amber-700 dark:file:bg-amber-500 dark:hover:file:bg-amber-400"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-fit rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {busy ? "Running Claude…" : "Run pipeline"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {step === "proof" ? (
          <section className="flex flex-col gap-8">
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-md dark:border-zinc-800 dark:bg-zinc-900/70">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Reference</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Raw extract or image-only placeholder.</p>
                <pre className="indic-editor mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-sm text-stone-800 dark:bg-zinc-950 dark:text-zinc-200">
                  {rawExtracted}
                </pre>
              </article>
              <article className="rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/50 p-5 dark:border-amber-800/40 dark:bg-amber-950/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300/90">Title</h3>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-amber-200/80 bg-white px-4 py-3 text-stone-900 shadow-inner outline-none ring-amber-500/30 focus:ring-2 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-stone-100"
                  placeholder="Record title"
                />
              </article>
            </div>

            <div className="space-y-6">
              <TemplateCard
                accentBar="bg-teal-600"
                badge="Transcribe"
                subtitle="Exact Gujarati, Hindi, or mixed source — matras, halant, punctuation."
              >
                <IndicEditor
                  label=""
                  value={transcription}
                  onChange={setTranscription}
                  minHeightClass="min-h-[260px]"
                />
              </TemplateCard>

              <TemplateCard
                accentBar="bg-indigo-600"
                badge="Translate"
                subtitle="English that matches the depth and meaning of the original."
              >
                <label className="sr-only" htmlFor="translation-field">
                  Translation
                </label>
                <textarea
                  id="translation-field"
                  spellCheck={true}
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="translation-editor min-h-[220px] w-full resize-y rounded-xl border border-stone-200 bg-white p-4 text-stone-900 shadow-inner outline-none ring-indigo-500/25 focus:border-indigo-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-stone-100"
                />
              </TemplateCard>

              <TemplateCard
                accentBar="bg-amber-600"
                badge="Proofread"
                subtitle="Uncertain readings, cross-outs, glossary — for double-checking."
              >
                <label className="sr-only" htmlFor="proof-field">
                  Proofreading notes
                </label>
                <textarea
                  id="proof-field"
                  spellCheck={true}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="notes-editor min-h-[160px] w-full resize-y rounded-xl border border-stone-200 bg-white p-4 text-stone-900 shadow-inner outline-none ring-amber-500/25 focus:border-amber-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-stone-100"
                />
              </TemplateCard>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || !transcription.trim() || !translation.trim()}
                onClick={() => void onApprove()}
                className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-500 disabled:opacity-45"
              >
                {busy ? "Saving…" : "Approve & save"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep("upload");
                  setErr(null);
                }}
                className="rounded-xl border border-stone-300 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 backdrop-blur hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Discard
              </button>
            </div>
          </section>
        ) : null}

        {step === "saved" ? (
          <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-8 shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950/35">
            <h2 className="text-xl font-semibold text-emerald-950 dark:text-emerald-100">Saved to library</h2>
            <p className="mt-2 text-sm text-emerald-900/90 dark:text-emerald-200/90">
              Id:{" "}
              <code className="rounded-lg bg-white/70 px-2 py-0.5 font-mono text-xs dark:bg-zinc-900">{savedId}</code>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("upload");
                  setErr(null);
                  setSavedId(null);
                }}
                className="rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                New upload
              </button>
              <Link
                href="/library"
                className="inline-flex items-center rounded-xl border border-emerald-800/30 px-6 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-100/80 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
              >
                Open library
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
