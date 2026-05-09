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
  const prompt = args.prompt ?? `Si tienes ${total} ${emoji} y se van ${takeAway}, ¿cuántos quedan?`;
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
      <div className="flex flex-wrap justify-center gap-2 rounded-2xl border-4 border-orange-200 bg-orange-50 p-4 mb-4 min-h-24">
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
            "w-28 rounded-2xl border-4 border-orange-300 bg-white p-3 text-center text-3xl font-extrabold",
            "focus:outline-none focus:border-orange-500",
            submitted && numericAnswer === expected && "border-green-400 bg-green-50",
            submitted && numericAnswer !== expected && "border-red-400 bg-red-50",
          )}
        />
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={!isValid}
            className={cn(
              "rounded-2xl bg-orange-400 px-6 py-3 text-lg font-bold text-white shadow",
              "transition-transform hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Listo ✨
          </button>
        ) : (
          <p className="text-center text-lg font-bold">
            {numericAnswer === expected
              ? "🎉 ¡Genial!"
              : `💡 Quedan ${expected}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
