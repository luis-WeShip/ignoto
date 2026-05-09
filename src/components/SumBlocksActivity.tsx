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
        "flex flex-wrap content-start justify-center gap-1 rounded-2xl border-4 p-3 min-h-24 min-w-24 flex-1",
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
        <Group count={left} color="border-sky-300 bg-sky-50" />
        <span className="text-4xl font-extrabold text-slate-700">+</span>
        <Group count={right} color="border-pink-300 bg-pink-50" />
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
            "w-28 rounded-2xl border-4 border-amber-300 bg-white p-3 text-center text-3xl font-extrabold",
            "focus:outline-none focus:border-amber-500",
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
              "rounded-2xl bg-amber-400 px-6 py-3 text-lg font-bold text-white shadow",
              "transition-transform hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Listo ✨
          </button>
        ) : (
          <p className="text-center text-lg font-bold">
            {numericAnswer === expected
              ? "🎉 ¡Perfecto!"
              : `💡 La respuesta era ${expected}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
