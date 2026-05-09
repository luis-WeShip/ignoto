"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { KawaiiBlob } from "./KawaiiBlob";

type ControlValue = number | boolean | string;

export interface RawControl {
  kind: "slider" | "button" | "toggle" | "picker";
  id: string;
  label: string;
  emoji?: string;
  // slider
  min?: number;
  max?: number;
  step?: number;
  initialNumber?: number;
  unit?: string;
  // button
  targetVar?: string;
  delta?: number;
  // toggle
  onLabel?: string;
  offLabel?: string;
  initialOn?: boolean;
  // picker
  options?: { label: string; value: string; emoji?: string }[];
  initialValue?: string;
}

export interface BandCondition {
  controlId: string;
  min?: number;
  max?: number;
  /** Valor exacto como string. Para toggle usa "true"/"false"; para picker usa el value. */
  equals?: string;
}

export type BandStatus = "great" | "good" | "warning" | "danger";

export interface Band {
  when: BandCondition[];
  status?: BandStatus;
  message: string;
  emoji?: string;
  healthPct?: number;
  detail?: string;
}

export interface MiniAppActivityArgs {
  title: string;
  intro: string;
  scene?: string;
  controls: RawControl[];
  bands?: Band[];
  reactionTemplate?: string;
  finishLabel?: string;
}

interface Props {
  args: Partial<MiniAppActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

const STATUS_STYLES: Record<
  BandStatus,
  { bar: string; border: string; bg: string; text: string }
> = {
  great: {
    bar: "bg-mint",
    border: "border-mint/50",
    bg: "bg-mint/15",
    text: "text-mint-foreground",
  },
  good: {
    bar: "bg-primary",
    border: "border-primary/40",
    bg: "bg-primary/10",
    text: "text-primary-foreground",
  },
  warning: {
    bar: "bg-accent",
    border: "border-accent/50",
    bg: "bg-accent/15",
    text: "text-accent-foreground",
  },
  danger: {
    bar: "bg-coral",
    border: "border-coral/50",
    bg: "bg-coral/20",
    text: "text-coral-foreground",
  },
};

function matchBand(
  state: Record<string, ControlValue>,
  band: Band,
): boolean {
  for (const cond of band.when ?? []) {
    const v = state[cond.controlId];
    if (cond.equals !== undefined) {
      if (String(v) !== cond.equals) return false;
      continue;
    }
    if (typeof v !== "number") return false;
    if (cond.min !== undefined && v < cond.min) return false;
    if (cond.max !== undefined && v > cond.max) return false;
  }
  return true;
}

function findBand(
  state: Record<string, ControlValue>,
  bands: Band[],
): Band | null {
  for (const band of bands) {
    if (matchBand(state, band)) return band;
  }
  return null;
}

export function MiniAppActivity({ args, status, respond }: Props) {
  const title = args.title ?? "Mini app";
  const intro = args.intro ?? "Vamos a explorar.";
  const scene = args.scene ?? "";
  const controls = args.controls ?? [];
  const bands = args.bands ?? [];
  const reactionTemplate = args.reactionTemplate ?? "";
  const finishLabel = args.finishLabel ?? "Listo ✨";

  const [state, setState] = useState<Record<string, ControlValue>>(() => {
    const init: Record<string, ControlValue> = {};
    for (const c of controls) {
      if (c.kind === "slider") {
        init[c.id] = c.initialNumber ?? c.min ?? 0;
      } else if (c.kind === "toggle") {
        init[c.id] = c.initialOn ?? false;
      } else if (c.kind === "picker") {
        init[c.id] = c.initialValue ?? c.options?.[0]?.value ?? "";
      } else if (c.kind === "button") {
        const target = c.targetVar ?? c.id;
        if (init[target] === undefined) init[target] = 0;
      }
    }
    return init;
  });

  const evalTemplate = (t: string) => {
    const norm = t.replace(/[｛❴]/g, "{").replace(/[｝❵]/g, "}");
    const replaceVar = (id: string) => {
      const cleanId = id.trim();
      const v =
        state[cleanId] ??
        state[
          Object.keys(state).find(
            (k) => k.toLowerCase() === cleanId.toLowerCase(),
          ) ?? ""
        ];
      if (typeof v === "boolean") return v ? "✓" : "✗";
      if (v == null || v === "") return `[${cleanId}=?]`;
      return String(v);
    };
    return norm
      .replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, id) => replaceVar(id))
      .replace(/\{\s*([\w-]+)\s*\}/g, (_, id) => replaceVar(id));
  };

  const liveValues = controls
    .map((c) => {
      const target = c.kind === "button" ? c.targetVar ?? c.id : c.id;
      const v = state[target];
      if (v === undefined || v === "") return null;
      const display =
        typeof v === "boolean"
          ? v
            ? c.onLabel ?? "✓"
            : c.offLabel ?? "✗"
          : `${v}${c.kind === "slider" && c.unit ? ` ${c.unit}` : ""}`;
      const labelEmoji = c.emoji ? `${c.emoji} ` : "";
      return `${labelEmoji}${c.label}: ${display}`;
    })
    .filter(Boolean)
    .join(" · ");

  const updateValue = (id: string, value: ControlValue) =>
    setState((s) => ({ ...s, [id]: value }));

  const onButton = (c: RawControl) =>
    setState((s) => {
      const target = c.targetVar ?? c.id;
      const cur = (s[target] as number) ?? 0;
      return { ...s, [target]: cur + (c.delta ?? 1) };
    });

  const finish = () => {
    if (!respond) return;
    respond(JSON.stringify({ activity: "miniapp", finalState: state, title }));
  };

  const activeBand = bands.length > 0 ? findBand(state, bands) : null;
  const styles = STATUS_STYLES[activeBand?.status ?? "good"];

  if (typeof window !== "undefined") {
    console.log("[MiniApp]", {
      state,
      activeBand,
      reactionTemplate,
    });
  }

  if (status === "complete") {
    return (
      <div className="my-2 inline-flex items-center gap-2 rounded-2xl border-2 border-mint/40 bg-mint/15 p-3 font-display text-sm">
        <span>✅</span>
        <span>
          <strong>{title}</strong> · terminada
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-3 sm:p-6 animate-pop-in">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-8 left-8 animate-float opacity-50">
          <KawaiiBlob shape="pentagon" color="var(--sky)" size={88} mood="happy" />
        </div>
        <div
          className="absolute top-12 right-10 animate-float opacity-50"
          style={{ animationDelay: "0.4s" }}
        >
          <KawaiiBlob shape="circle" color="var(--coral)" size={72} mood="wink" />
        </div>
        <div
          className="absolute bottom-12 right-12 animate-float opacity-50"
          style={{ animationDelay: "0.8s" }}
        >
          <KawaiiBlob shape="drop" color="var(--accent)" size={80} mood="smile" />
        </div>
        <div
          className="absolute bottom-16 left-12 animate-float opacity-50"
          style={{ animationDelay: "1.1s" }}
        >
          <KawaiiBlob
            shape="triangle"
            color="var(--mint)"
            size={68}
            mood="sleepy"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-soft max-h-[calc(100vh-1.5rem)] overflow-auto">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="animate-bounce-slow shrink-0">
              <KawaiiBlob
                shape="blob"
                color="var(--primary)"
                size={48}
                mood="star"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{intro}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            aria-label="Salir"
            className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center border-2 border-border bg-card hover:bg-muted shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none"
          >
            ✕
          </button>
        </header>

        {scene ? (
          <div className="rounded-2xl border-2 border-mint/40 bg-mint/15 p-5 mb-4 text-center">
            <p className="text-5xl leading-none">{scene}</p>
          </div>
        ) : null}

        <div className="space-y-3 mb-4">
          {controls.map((c) => (
            <ControlRenderer
              key={c.id}
              control={c}
              value={state[c.id]}
              onChange={(v) => updateValue(c.id, v)}
              onButton={() => c.kind === "button" && onButton(c)}
            />
          ))}
        </div>

        {/* Banda activa = simulación con consecuencias reales */}
        {activeBand ? (
          <div
            className={cn(
              "rounded-2xl border-2 p-4 mb-3 transition-colors",
              styles.border,
              styles.bg,
            )}
          >
            <div className="flex items-start gap-3">
              {activeBand.emoji ? (
                <span className="text-5xl leading-none shrink-0 animate-pop-in">
                  {activeBand.emoji}
                </span>
              ) : null}
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg font-bold text-foreground">
                  {activeBand.message}
                </p>
                {activeBand.detail ? (
                  <p className="text-sm text-foreground/70 mt-1 leading-relaxed">
                    {activeBand.detail}
                  </p>
                ) : null}
                {typeof activeBand.healthPct === "number" ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1 text-xs font-display font-semibold text-muted-foreground">
                      <span>Salud</span>
                      <span>{Math.round(activeBand.healthPct)}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/50">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-out",
                          styles.bar,
                        )}
                        style={{
                          width: `${Math.max(0, Math.min(100, activeBand.healthPct))}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Live values: fallback siempre visible */}
        {liveValues || reactionTemplate ? (
          <div className="rounded-2xl border-2 border-border bg-card p-3 mb-4 text-center">
            {reactionTemplate ? (
              <p className="font-display text-base">
                {evalTemplate(reactionTemplate)}
              </p>
            ) : null}
            {liveValues ? (
              <p
                className={cn(
                  "font-display text-xs text-muted-foreground",
                  reactionTemplate ? "mt-1" : "",
                )}
              >
                {liveValues}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={finish}
            className={cn(
              "rounded-full bg-primary text-primary-foreground px-6 py-3 font-display text-lg font-bold",
              "shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
            )}
          >
            {finishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlRenderer({
  control,
  value,
  onChange,
  onButton,
}: {
  control: RawControl;
  value: ControlValue | undefined;
  onChange: (v: ControlValue) => void;
  onButton: () => void;
}) {
  if (control.kind === "slider") {
    const min = control.min ?? 0;
    const max = control.max ?? 10;
    const v = (value as number) ?? control.initialNumber ?? min;
    return (
      <div className="rounded-2xl border-2 border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="font-display font-semibold text-sm">
            {control.emoji ? (
              <span className="mr-1 text-base">{control.emoji}</span>
            ) : null}
            {control.label}
          </label>
          <span className="font-display font-bold text-primary text-lg">
            {v}
            {control.unit ? (
              <span className="ml-1 text-xs text-muted-foreground">
                {control.unit}
              </span>
            ) : null}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={control.step ?? 1}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
      </div>
    );
  }
  if (control.kind === "button") {
    return (
      <button
        type="button"
        onClick={onButton}
        className="w-full rounded-2xl border-2 border-border bg-card p-3 font-display font-bold shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95 flex items-center justify-center gap-2"
      >
        {control.emoji ? (
          <span className="text-2xl">{control.emoji}</span>
        ) : null}
        {control.label}
      </button>
    );
  }
  if (control.kind === "toggle") {
    const v = !!value;
    return (
      <button
        type="button"
        onClick={() => onChange(!v)}
        className="w-full rounded-2xl border-2 border-border bg-card p-3 font-display font-bold shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95 flex items-center justify-between"
      >
        <span>{control.label}</span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-display",
            v
              ? "bg-mint text-mint-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {v ? control.onLabel ?? "Sí" : control.offLabel ?? "No"}
        </span>
      </button>
    );
  }
  if (control.kind === "picker") {
    const opts = control.options ?? [];
    const v =
      (value as string) ?? control.initialValue ?? opts[0]?.value ?? "";
    return (
      <div className="rounded-2xl border-2 border-border bg-card p-3">
        <p className="font-display font-semibold text-sm mb-2">
          {control.label}
        </p>
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => {
            const selected = opt.value === v;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "rounded-full px-4 py-2 border-2 font-display font-semibold text-sm shadow-pop transition-transform hover:translate-y-0.5 hover:shadow-none active:scale-95",
                  selected
                    ? "bg-primary text-primary-foreground border-primary/40"
                    : "bg-card border-border",
                )}
              >
                {opt.emoji ? (
                  <span className="mr-1">{opt.emoji}</span>
                ) : null}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
