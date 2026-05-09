"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface FractionPieActivityArgs {
  prompt: string;
  denominator: number;
  expectedNumerator: number;
  emoji?: string;
}

interface Props {
  args: Partial<FractionPieActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function FractionPieActivity({ args, status, respond }: Props) {
  const denominator = Math.max(2, Math.min(12, args.denominator ?? 4));
  const expectedNumerator = Math.max(
    0,
    Math.min(denominator, args.expectedNumerator ?? 1),
  );
  const prompt = args.prompt ?? `Haz la fracción ${expectedNumerator}/${denominator}`;
  const emoji = args.emoji ?? "🍕";

  const [filled, setFilled] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const numerator = filled.size;

  const toggleSlice = (i: number) => {
    if (submitted) return;
    setFilled((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const submit = () => {
    if (submitted || !respond) return;
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "fraction_pie",
        chosenNumerator: numerator,
        denominator,
        expectedNumerator,
        correct: numerator === expectedNumerator,
      }),
    );
  };

  const sliceAngle = 360 / denominator;
  const cx = 100;
  const cy = 100;
  const r = 84;

  return (
    <ActivityShell title={prompt} emoji={emoji} status={status}>
      <div className="flex justify-center mb-3">
        <svg viewBox="0 0 200 200" width="220" height="220">
          {Array.from({ length: denominator }).map((_, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const isFilled = filled.has(i);
            const isCorrect = submitted && numerator === expectedNumerator;
            const isWrong = submitted && numerator !== expectedNumerator;
            return (
              <path
                key={i}
                d={slicePath(cx, cy, r, startAngle, endAngle)}
                className={cn(
                  "transition-colors cursor-pointer",
                  isFilled
                    ? isCorrect
                      ? "fill-mint stroke-mint-foreground"
                      : isWrong
                        ? "fill-coral stroke-coral-foreground"
                        : "fill-accent stroke-accent-foreground"
                    : "fill-card hover:fill-muted stroke-border",
                  submitted && "cursor-not-allowed",
                )}
                strokeWidth="2"
                onClick={() => toggleSlice(i)}
              />
            );
          })}
          {/* center dot */}
          <circle cx={cx} cy={cy} r="3" className="fill-foreground/30" />
        </svg>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="rounded-2xl border-2 border-border bg-card px-4 py-2 text-center">
          <div className="text-xs font-display font-semibold text-muted-foreground">
            Tienes
          </div>
          <div className="font-display font-extrabold text-2xl text-primary">
            {numerator}
            <span className="text-muted-foreground">/</span>
            {denominator}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-mint/50 bg-mint/15 px-4 py-2 text-center">
          <div className="text-xs font-display font-semibold text-mint-foreground/70">
            Buscas
          </div>
          <div className="font-display font-extrabold text-2xl text-mint-foreground">
            {expectedNumerator}
            <span className="opacity-50">/</span>
            {denominator}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            className={cn(
              "rounded-full bg-primary text-primary-foreground px-6 py-3 font-display font-bold",
              "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
            )}
          >
            Listo ✨
          </button>
        ) : (
          <p className="font-display font-bold text-lg animate-pop-in">
            {numerator === expectedNumerator
              ? "🎉 ¡Perfecto!"
              : `💡 Tenías ${numerator}/${denominator}, faltaba ${expectedNumerator}/${denominator}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
