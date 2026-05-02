"use client";

import { useCallback, useRef, useState } from "react";
import { IndicVirtualKeyboard } from "@/components/IndicVirtualKeyboard";
import { KEYBOARD_LAYOUTS, type KeyboardId } from "@/lib/indicKeyboardLayouts";

type Props = {
  value: string;
  onChange: (v: string) => void;
  label: string;
  minHeightClass?: string;
};

export function IndicEditor({ value, onChange, label, minHeightClass = "min-h-[280px]" }: Props) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<KeyboardId>("gujarati");

  const insert = useCallback(
    (chars: string) => {
      const el = ta.current;
      if (!el) {
        onChange(value + chars);
        return;
      }
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      const next = value.slice(0, start) + chars + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + chars.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [onChange, value],
  );

  return (
    <div className="flex flex-col gap-3">
      {label.trim() ? (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</label>
      ) : null}
      <textarea
        ref={ta}
        dir="ltr"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`indic-editor ${minHeightClass} w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 text-lg leading-relaxed text-zinc-900 shadow-inner outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50`}
      />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(KEYBOARD_LAYOUTS) as KeyboardId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tab === id
                ? "bg-amber-600 text-white shadow"
                : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
            }`}
          >
            {KEYBOARD_LAYOUTS[id].label}
          </button>
        ))}
      </div>
      <IndicVirtualKeyboard active={tab} onInsert={insert} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Use your system input method for full typing; the on-screen keys help with rare characters and zero-width
        joiners for conjuncts.
      </p>
    </div>
  );
}
