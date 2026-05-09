"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface SumBlocksActivityArgs {
  leftCount: number;
  rightCount: number;
  emoji: string;
  prompt: string;
}

interface Props {
  args: Partial<SumBlocksActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

export function SumBlocksActivity({ args, status, respond }: Props) {
  const left = Math.max(0, Math.min(10, args.leftCount ?? 0));
  const right = Math.max(0, Math.min(10, args.rightCount ?? 0));
  const expected = left + right;
  const emoji = args.emoji ?? "🍎";
  const prompt = args.prompt ?? `¿Cuántos ${emoji} hay en total?`;

  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const numericAnswer = Number.parseInt(answer, 10);
  const isValid = Number.isFinite(numericAnswer);

  const submit = () => {
    if (submitted || !respond || !isValid) return;
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "sum_blocks",
        left,
        right,
        chosen: numericAnswer,
        expected,
        correct: numericAnswer === expected,
      }),
    );
  };

  const Group = ({ count, color }: { count: number; color: string }) => (
    <div
      className={cn(
        "flex flex-wrap content-start justify-center gap-1 rounded-2xl border-2 p-3 min-h-24 flex-1",
        color,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-3xl">
          {emoji}
        </span>
      ))}
    </div>
  );

  return (
    <ActivityShell title={prompt} emoji="➕" status={status}>
      <div className="flex items-center gap-2 mb-4">
        <Group count={left} color="border-sky/40 bg-sky/15" />
        <span className="font-display text-4xl font-extrabold text-primary">
          +
        </span>
        <Group count={right} color="border-coral/40 bg-coral/15" />
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
              ? "🎉 ¡Perfecto!"
              : `💡 La respuesta era ${expected}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
