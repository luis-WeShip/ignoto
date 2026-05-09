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
    respond(
      JSON.stringify({
        activity: "counting",
        chosen: n,
        expected,
        correct: n === expected,
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
      <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-sky/15 p-4 mb-4 border-2 border-sky/30">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="text-4xl animate-bounce-slow"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <p className="text-center font-display font-bold text-base mb-3">
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
                "h-16 w-16 rounded-2xl bg-sky text-sky-foreground font-display font-extrabold text-2xl",
                "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                isCorrect && "bg-mint text-mint-foreground",
                isWrong && "bg-coral text-coral-foreground",
                submitted && !isSelected && "opacity-50",
                submitted && "cursor-not-allowed",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      {submitted ? (
        <p className="mt-4 text-center font-display text-lg font-bold animate-pop-in">
          {selected === expected ? "🎉 ¡Muy bien!" : "💡 ¡Intentamos otra!"}
        </p>
      ) : null}
    </ActivityShell>
  );
}
