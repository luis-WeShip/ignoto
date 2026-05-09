"use client";

import { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface ColorMixerActivityArgs {
  prompt: string;
  expectedColor?: string;
}

interface Props {
  args: Partial<ColorMixerActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

type Primary = "rojo" | "azul" | "amarillo";

const PRIMARIES: { id: Primary; label: string; hex: string }[] = [
  { id: "rojo", label: "Rojo", hex: "#ef4444" },
  { id: "azul", label: "Azul", hex: "#3b82f6" },
  { id: "amarillo", label: "Amarillo", hex: "#f59e0b" },
];

function mix(active: Set<Primary>): { name: string; hex: string } {
  const has = (...arr: Primary[]) =>
    arr.length === active.size && arr.every((c) => active.has(c));

  if (active.size === 0) return { name: "blanco", hex: "#fafafa" };
  if (has("rojo")) return { name: "rojo", hex: "#ef4444" };
  if (has("azul")) return { name: "azul", hex: "#3b82f6" };
  if (has("amarillo")) return { name: "amarillo", hex: "#f59e0b" };
  if (has("rojo", "azul")) return { name: "morado", hex: "#9333ea" };
  if (has("rojo", "amarillo")) return { name: "naranja", hex: "#fb923c" };
  if (has("azul", "amarillo")) return { name: "verde", hex: "#16a34a" };
  if (has("rojo", "azul", "amarillo"))
    return { name: "marrón", hex: "#78350f" };
  return { name: "blanco", hex: "#fafafa" };
}

function normalizeColorName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function ColorMixerActivity({ args, status, respond }: Props) {
  const prompt = args.prompt ?? "Mezcla colores y descubre qué sale";
  const expectedColor = args.expectedColor
    ? normalizeColorName(args.expectedColor)
    : null;

  const [active, setActive] = useState<Set<Primary>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const result = mix(active);
  const isMatch =
    expectedColor != null && normalizeColorName(result.name) === expectedColor;

  const toggle = (id: Primary) => {
    if (submitted) return;
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (submitted || !respond) return;
    setSubmitted(true);
    respond(
      JSON.stringify({
        activity: "color_mixer",
        active: Array.from(active),
        resulting: result.name,
        expectedColor: args.expectedColor ?? null,
        correct: expectedColor == null ? true : isMatch,
      }),
    );
  };

  return (
    <ActivityShell title={prompt} emoji="🎨" status={status}>
      {/* Swatch resultante */}
      <div
        className="rounded-3xl border-4 border-border p-6 mb-4 flex flex-col items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: result.hex }}
      >
        <span className="font-display font-extrabold text-2xl drop-shadow-sm capitalize text-white mix-blend-difference">
          {result.name}
        </span>
        {expectedColor ? (
          <span className="mt-1 font-display text-sm text-white mix-blend-difference">
            (objetivo: {args.expectedColor})
          </span>
        ) : null}
      </div>

      {/* Toggle de primarios */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {PRIMARIES.map((p) => {
          const on = active.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              disabled={submitted}
              className={cn(
                "rounded-2xl border-4 p-4 font-display font-bold text-white",
                "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                on
                  ? "border-foreground/30 ring-4 ring-foreground/15"
                  : "border-transparent opacity-60 grayscale",
                submitted && "cursor-not-allowed",
              )}
              style={{ backgroundColor: p.hex }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={expectedColor != null && active.size === 0}
            className={cn(
              "rounded-full bg-primary text-primary-foreground px-6 py-3 font-display font-bold",
              "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {expectedColor ? "Listo ✨" : "Cerrar 👋"}
          </button>
        ) : (
          <p className="font-display font-bold text-lg animate-pop-in">
            {expectedColor == null
              ? `Hiciste ${result.name} 🎨`
              : isMatch
                ? `🎉 ¡Sí! Es ${result.name}`
                : `💡 Salió ${result.name}, buscábamos ${args.expectedColor}`}
          </p>
        )}
      </div>
    </ActivityShell>
  );
}
