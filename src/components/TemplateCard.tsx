import type { ReactNode } from "react";

type Props = {
  accentBar: string;
  badge: string;
  subtitle: string;
  children: ReactNode;
};

export function TemplateCard({ accentBar, badge, subtitle, children }: Props) {
  return (
    <article className="flex overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-md dark:border-zinc-800 dark:bg-zinc-900/75">
      <div className={`w-1.5 shrink-0 ${accentBar}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="border-b border-stone-100 px-5 py-4 dark:border-zinc-800">
          <span className="inline-block rounded-full bg-stone-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white dark:bg-stone-100 dark:text-stone-900">
            {badge}
          </span>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{subtitle}</p>
        </div>
        <div className="p-5 pt-4">{children}</div>
      </div>
    </article>
  );
}
