"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface QuizOption {
  label: string;
  emoji?: string;
}

export interface QuizActivityArgs {
  question: string;
  options: QuizOption[];
  correctIndex: number;
}

interface Props {
  args: Partial<QuizActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

export function QuizActivity({ args, status, respond }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = args.question ?? "¿Cuál es la respuesta?";
  const options = (args.options ?? []).slice(0, 4);
  const correctIndex = args.correctIndex ?? 0;

  const submit = (idx: number) => {
    if (submitted || !respond) return;
    setSelected(idx);
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "quiz",
        chosenIndex: idx,
        chosenLabel: options[idx]?.label ?? "",
        correctIndex,
        correct: idx === correctIndex,
      }),
    );
  };

  return (
    <ActivityShell title={question} emoji="❓" status={status}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = submitted && i === correctIndex;
          const isWrong = submitted && isSelected && i !== correctIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => submit(i)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 border-border p-4 text-left bg-card",
                "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                isCorrect && "bg-mint border-mint/60 text-mint-foreground",
                isWrong && "bg-coral border-coral/60 text-coral-foreground",
                submitted && !isSelected && !isCorrect && "opacity-50",
                submitted && "cursor-not-allowed",
              )}
            >
              {opt.emoji ? (
                <span className="text-4xl">{opt.emoji}</span>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span className="font-display font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {submitted ? (
        <p className="mt-4 text-center font-display text-lg font-bold animate-pop-in">
          {selected === correctIndex
            ? "🎉 ¡Correcto!"
            : "💡 Casi, sigue intentando"}
        </p>
      ) : null}
    </ActivityShell>
  );
}
