import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const documents = await prisma.document.findMany({
    orderBy: { approvedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      originalFileName: true,
      approvedAt: true,
      transcription: true,
      translation: true,
      proofNotes: true,
      approvedBody: true,
    },
  });

  return (
    <div className="min-h-full bg-gradient-to-b from-stone-100 to-stone-200/90 dark:from-zinc-950 dark:to-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400/90">
              Jain Text
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Library</h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Approved three-part records.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            New upload
          </Link>
        </div>

        {documents.length === 0 ? (
          <p className="text-stone-600 dark:text-stone-400">Nothing saved yet.</p>
        ) : (
          <ul className="flex flex-col gap-8">
            {documents.map((d) => {
              const hasParts = d.transcription.trim().length > 0 || d.translation.trim().length > 0;
              return (
                <li
                  key={d.id}
                  className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/80"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-100 px-6 py-4 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{d.title}</h2>
                    <time className="text-xs text-stone-500 tabular-nums" dateTime={d.approvedAt.toISOString()}>
                      {d.approvedAt.toLocaleString()}
                    </time>
                  </div>
                  {d.originalFileName ? (
                    <p className="border-b border-stone-100 px-6 py-2 text-xs text-stone-500 dark:border-zinc-800 dark:text-zinc-400">
                      Source: {d.originalFileName}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-0">
                    {hasParts ? (
                      <>
                        <LibSection title="Transcribe" tone="teal">
                          <pre className="indic-editor whitespace-pre-wrap text-sm leading-relaxed text-stone-900 dark:text-stone-100">
                            {d.transcription || "—"}
                          </pre>
                        </LibSection>
                        <LibSection title="Translate" tone="indigo">
                          <div className="translation-editor whitespace-pre-wrap text-sm leading-relaxed text-stone-900 dark:text-stone-100">
                            {d.translation || "—"}
                          </div>
                        </LibSection>
                        <LibSection title="Proofread" tone="amber" last>
                          <pre className="notes-editor whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                            {d.proofNotes || "—"}
                          </pre>
                        </LibSection>
                      </>
                    ) : (
                      <div className="p-6">
                        <pre className="indic-editor max-h-96 overflow-auto whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                          {d.approvedBody}
                        </pre>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function LibSection({
  title,
  tone,
  last,
  children,
}: {
  title: string;
  tone: "teal" | "indigo" | "amber";
  last?: boolean;
  children: React.ReactNode;
}) {
  const bar = {
    teal: "bg-teal-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  }[tone];
  return (
    <section
      className={`flex gap-0 ${last ? "" : "border-b border-stone-100 dark:border-zinc-800"}`}
    >
      <div className={`w-1 shrink-0 ${bar}`} aria-hidden />
      <div className="min-w-0 flex-1 p-5 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </section>
  );
}
