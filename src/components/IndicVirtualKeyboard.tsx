"use client";

import { KEYBOARD_LAYOUTS, type KeyboardId } from "@/lib/indicKeyboardLayouts";

type Props = {
  active: KeyboardId;
  onInsert: (chars: string) => void;
};

export function IndicVirtualKeyboard({ active, onInsert }: Props) {
  const layout = KEYBOARD_LAYOUTS[active];

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{layout.label}</span>
        <span className="text-xs text-zinc-500">{layout.description}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {layout.rows.map((row, ri) => (
          <div key={ri} className="flex flex-wrap gap-1">
            {row.map((ch) => (
              <button
                key={`${ri}-${ch}`}
                type="button"
                onClick={() => onInsert(ch)}
                className="min-h-9 min-w-9 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-lg leading-none text-zinc-900 shadow-sm transition hover:bg-amber-50 hover:border-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                title={ch === "\n" ? "New line" : ch === "\u200c" ? "ZWNJ" : ch === "\u200d" ? "ZWJ" : undefined}
              >
                {ch === "\n" ? "↵" : ch === "\u200c" ? "ZWNJ" : ch === "\u200d" ? "ZWJ" : ch === "  " ? "␣␣" : ch}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
