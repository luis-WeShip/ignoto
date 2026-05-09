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
                "flex items-center gap-3 rounded-2xl border-4 p-4 text-left shadow",
                "transition-transform hover:scale-[1.02] active:scale-95",
                "border-purple-300 bg-purple-50",
                isCorrect && "border-green-400 bg-green-100",
                isWrong && "border-red-400 bg-red-100",
                submitted && !isSelected && !isCorrect && "opacity-60",
              )}
            >
              {opt.emoji ? (
                <span className="text-4xl">{opt.emoji}</span>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 font-bold text-purple-900">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span className="text-lg font-semibold text-slate-800">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {submitted ? (
        <p className="mt-4 text-center text-lg font-bold">
          {selected === correctIndex
            ? "🎉 ¡Correcto!"
            : "💡 Casi, sigue intentando"}
        </p>
      ) : null}
    </ActivityShell>
  );
}
