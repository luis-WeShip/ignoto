"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface CountingActivityArgs {
  prompt: string;
  emoji: string;
  count: number;
  expectedAnswer: number;
}

interface Props {
  args: Partial<CountingActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

export function CountingActivity({ args, status, respond }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const prompt = args.prompt ?? "Cuenta los objetos";
  const emoji = args.emoji ?? "⭐";
  const count = Math.max(0, Math.min(20, args.count ?? 0));
  const expected = args.expectedAnswer ?? count;

  const submit = (n: number) => {
    if (submitted || !respond) return;
    setSelected(n);
    setSubmitted(true);
    const correct = n === expected;
    respond(
      JSON.stringify({
        activity: "counting",
        chosen: n,
        expected,
        correct,
      }),
    );
  };

  const choices = Array.from(
    new Set([
      Math.max(0, expected - 1),
      expected,
      expected + 1,
      Math.max(0, expected - 2),
    ]),
  )
    .slice(0, 4)
    .sort((a, b) => a - b);

  return (
    <ActivityShell title={prompt} emoji="🔢" status={status}>
      <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/70 p-4 mb-4">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="text-4xl animate-[bounce_1.5s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <p className="text-center text-slate-700 mb-3 font-medium">
        ¿Cuántos hay?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {choices.map((n) => {
          const isSelected = selected === n;
          const isCorrect = submitted && n === expected;
          const isWrong = submitted && isSelected && n !== expected;
          return (
            <button
              key={n}
              type="button"
              disabled={submitted}
              onClick={() => submit(n)}
              className={cn(
                "h-16 w-16 rounded-2xl border-4 text-2xl font-extrabold shadow",
                "transition-transform hover:scale-105 active:scale-95",
                "border-sky-300 bg-sky-100 text-sky-900",
                isSelected && "ring-4 ring-offset-2",
                isCorrect && "border-green-400 bg-green-200 ring-green-400",
                isWrong && "border-red-400 bg-red-200 ring-red-400",
                submitted && !isSelected && "opacity-60",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      {submitted ? (
        <p className="mt-4 text-center text-lg font-bold">
          {selected === expected ? "🎉 ¡Muy bien!" : "💡 Intentamos otra"}
        </p>
      ) : null}
    </ActivityShell>
  );
}
