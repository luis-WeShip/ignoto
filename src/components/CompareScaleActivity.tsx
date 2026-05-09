"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface CompareScaleActivityArgs {
  prompt: string;
  leftCount: number;
  leftEmoji: string;
  rightCount: number;
  rightEmoji: string;
}

type Op = "lt" | "eq" | "gt";

interface Props {
  args: Partial<CompareScaleActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

const OP_LABELS: Record<Op, string> = {
  lt: "<",
  eq: "=",
  gt: ">",
};

function correctOp(left: number, right: number): Op {
  if (left < right) return "lt";
  if (left > right) return "gt";
  return "eq";
}

export function CompareScaleActivity({ args, status, respond }: Props) {
  const left = Math.max(0, Math.min(15, args.leftCount ?? 0));
  const right = Math.max(0, Math.min(15, args.rightCount ?? 0));
  const leftEmoji = args.leftEmoji ?? "🍎";
  const rightEmoji = args.rightEmoji ?? "🍌";
  const prompt = args.prompt ?? "¿Cuál grupo tiene más?";

  const [picked, setPicked] = useState<Op | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const expected = correctOp(left, right);

  // Tilt: positivo si izquierda pesa más → izquierda baja (negativo en transform)
  const diff = left - right;
  const tilt = Math.max(-12, Math.min(12, -diff * 2.5));

  const submit = (op: Op) => {
    if (submitted || !respond) return;
    setPicked(op);
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "compare_scale",
        leftCount: left,
        rightCount: right,
        chosen: OP_LABELS[op],
        correct: op === expected,
      }),
    );
  };

  return (
    <ActivityShell title={prompt} emoji="⚖️" status={status}>
      {/* Balanza */}
      <div className="relative h-44 mb-4">
        {/* Pivote */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-b-[36px] border-transparent border-b-primary" />
        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-32 h-2 rounded-full bg-primary/40" />

        {/* Brazo + platos */}
        <div
          className="absolute bottom-9 left-0 right-0 mx-auto w-[min(360px,90%)] transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "center" }}
        >
          <div className="h-2 bg-primary rounded-full" />
          {/* Plato izquierdo */}
          <div className="absolute -top-2 left-0 -translate-y-full w-[44%]">
            <div className="rounded-2xl border-2 border-sky/60 bg-sky/20 p-2 min-h-16 flex flex-wrap justify-center items-center gap-1">
              {Array.from({ length: left }).map((_, i) => (
                <span key={i} className="text-2xl">
                  {leftEmoji}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-1 w-px h-3 bg-primary/60" />
          </div>
          {/* Plato derecho */}
          <div className="absolute -top-2 right-0 -translate-y-full w-[44%]">
            <div className="rounded-2xl border-2 border-coral/60 bg-coral/20 p-2 min-h-16 flex flex-wrap justify-center items-center gap-1">
              {Array.from({ length: right }).map((_, i) => (
                <span key={i} className="text-2xl">
                  {rightEmoji}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-1 w-px h-3 bg-primary/60" />
          </div>
        </div>
      </div>

      {/* Conteos auxiliares */}
      <div className="flex items-center justify-center gap-3 mb-3 font-display text-sm font-semibold text-muted-foreground">
        <span>
          {leftEmoji} = {left}
        </span>
        <span>·</span>
        <span>
          {rightEmoji} = {right}
        </span>
      </div>

      {/* Botones < = > */}
      <div className="flex justify-center gap-3">
        {(Object.keys(OP_LABELS) as Op[]).map((op) => {
          const isPicked = picked === op;
          const isCorrect = submitted && op === expected;
          const isWrong = submitted && isPicked && op !== expected;
          return (
            <button
              key={op}
              type="button"
              disabled={submitted}
              onClick={() => submit(op)}
              className={cn(
                "h-16 w-16 rounded-2xl border-2 border-border bg-card font-display font-extrabold text-3xl",
                "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                isCorrect && "bg-mint border-mint/50 text-mint-foreground",
                isWrong && "bg-coral border-coral/50 text-coral-foreground",
                submitted && !isPicked && !isCorrect && "opacity-50",
                submitted && "cursor-not-allowed",
              )}
            >
              {OP_LABELS[op]}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <p className="mt-4 text-center font-display text-lg font-bold animate-pop-in">
          {picked === expected
            ? "🎉 ¡Sí!"
            : `💡 La correcta era ${OP_LABELS[expected]}`}
        </p>
      ) : null}
    </ActivityShell>
  );
}
