"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface SubtractBlocksActivityArgs {
  total: number;
  takeAway: number;
  emoji: string;
  prompt: string;
}

interface Props {
  args: Partial<SubtractBlocksActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

export function SubtractBlocksActivity({ args, status, respond }: Props) {
  const total = Math.max(0, Math.min(15, args.total ?? 0));
  const takeAway = Math.max(0, Math.min(total, args.takeAway ?? 0));
  const emoji = args.emoji ?? "🍪";
  const prompt =
    args.prompt ??
    `Si tienes ${total} ${emoji} y se van ${takeAway}, ¿cuántos quedan?`;
  const expected = total - takeAway;

  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const numericAnswer = Number.parseInt(answer, 10);
  const isValid = Number.isFinite(numericAnswer);

  const submit = () => {
    if (submitted || !respond || !isValid) return;
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "subtract_blocks",
        total,
        takeAway,
        chosen: numericAnswer,
        expected,
        correct: numericAnswer === expected,
      }),
    );
  };

  return (
    <ActivityShell title={prompt} emoji="➖" status={status}>
      <div className="flex flex-wrap justify-center gap-2 rounded-2xl border-2 border-accent/40 bg-accent/15 p-4 mb-4 min-h-24">
        {Array.from({ length: total }).map((_, i) => {
          const removed = i >= total - takeAway;
          return (
            <span
              key={i}
              className={cn(
                "text-3xl transition-all",
                removed && "opacity-30 grayscale [text-decoration:line-through]",
              )}
            >
              {emoji}
            </span>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          disabled={submitted}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="?"
          className={cn(
            "w-28 rounded-2xl border-2 border-accent bg-card p-3 text-center font-display text-3xl font-extrabold",
            "focus:outline-none focus:ring-4 focus:ring-accent/40",
            submitted &&
              numericAnswer === expected &&
              "border-mint/60 bg-mint/15",
            submitted &&
              numericAnswer !== expected &&
              "border-coral/60 bg-coral/15",
          )}
        />
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={!isValid}
            className={cn(
              "rounded-full bg-accent text-accent-foreground px-6 py-3 font-display text-lg font-bold",
              "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-pop",
            )}
          >
            Listo ✨
          </button>
        ) : (
          <p className="text-center font-display text-lg font-bold animate-pop-in">
            {numericAnswer === expected
              ? "🎉 ¡Genial!"
              : `💡 Quedan ${expected}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
