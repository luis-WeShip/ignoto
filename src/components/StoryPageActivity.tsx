"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface StoryChoice {
  label: string;
  emoji?: string;
  id: string;
}

export interface StoryPageActivityArgs {
  scene: string;
  emojiArt: string;
  text: string;
  choices: StoryChoice[];
}

interface Props {
  args: Partial<StoryPageActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

export function StoryPageActivity({ args, status, respond }: Props) {
  const [chosenId, setChosenId] = useState<string | null>(null);

  const scene = args.scene ?? "Un cuento";
  const emojiArt = args.emojiArt ?? "🌳🦋🌳";
  const text = args.text ?? "Había una vez...";
  const choices = (args.choices ?? []).slice(0, 3);

  const submit = (id: string, label: string) => {
    if (chosenId || !respond) return;
    setChosenId(id);
    respond(
      JSON.stringify({
        activity: "story",
        chosenId: id,
        chosenLabel: label,
      }),
    );
  };

  return (
    <ActivityShell title={scene} emoji="📖" status={status}>
      <div className="rounded-2xl border-4 border-emerald-200 bg-emerald-50 p-4 mb-4 text-center">
        <p className="text-5xl mb-3 leading-none">{emojiArt}</p>
        <p className="text-base text-slate-800 leading-relaxed">{text}</p>
      </div>

      <p className="text-center text-sm font-semibold text-slate-700 mb-3">
        ¿Qué hace ahora?
      </p>
      <div className="grid grid-cols-1 gap-2">
        {choices.map((c) => {
          const isSelected = chosenId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={!!chosenId}
              onClick={() => submit(c.id, c.label)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-4 p-3 text-left shadow",
                "transition-transform hover:scale-[1.01] active:scale-95",
                "border-emerald-300 bg-white",
                isSelected && "border-emerald-500 bg-emerald-100 ring-4 ring-emerald-300",
                chosenId && !isSelected && "opacity-50",
              )}
            >
              {c.emoji ? <span className="text-3xl">{c.emoji}</span> : null}
              <span className="font-semibold text-slate-800">{c.label}</span>
            </button>
          );
        })}
      </div>
    </ActivityShell>
  );
}
