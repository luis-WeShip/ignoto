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
      <div className="rounded-2xl border-2 border-mint/40 bg-mint/15 p-4 mb-4 text-center">
        <p className="text-5xl mb-3 leading-none">{emojiArt}</p>
        <p className="font-display text-base text-foreground/90 leading-relaxed">
          {text}
        </p>
      </div>

      <p className="text-center font-display text-sm font-bold text-muted-foreground mb-3">
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
                "flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 text-left",
                "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                isSelected &&
                  "bg-primary text-primary-foreground border-primary/50",
                chosenId && !isSelected && "opacity-50",
                chosenId && "cursor-not-allowed",
              )}
            >
              {c.emoji ? <span className="text-3xl">{c.emoji}</span> : null}
              <span className="font-display font-semibold">{c.label}</span>
            </button>
          );
        })}
      </div>
    </ActivityShell>
  );
}
