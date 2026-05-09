"use client";

import { useEffect, useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface CelebrationActivityArgs {
  message: string;
  badge: string;
}

interface Props {
  args: Partial<CelebrationActivityArgs>;
  status: "executing" | "complete" | "inProgress";
}

const CONFETTI = ["🎉", "🎊", "⭐", "✨", "💫", "🌟", "🎈", "🏆"];

export function CelebrationActivity({ args, status }: Props) {
  const message = args.message ?? "¡Lo lograste!";
  const badge = args.badge ?? "🏆";
  const [pieces, setPieces] = useState<
    { id: number; emoji: string; left: number; delay: number }[]
  >([]);

  useEffect(() => {
    const arr = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
    }));
    setPieces(arr);
  }, []);

  return (
    <ActivityShell title={message} emoji="🥳" status={status}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200 p-6 min-h-40">
        <div
          className={cn(
            "relative z-10 flex flex-col items-center justify-center gap-2",
          )}
        >
          <span className="text-7xl drop-shadow-lg">{badge}</span>
          <p className="text-xl font-extrabold text-slate-800 text-center">
            {message}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 z-0">
          {pieces.map((p) => (
            <span
              key={p.id}
              className="absolute text-2xl"
              style={{
                left: `${p.left}%`,
                top: `-10%`,
                animation: `fall 2.4s ${p.delay}s ease-in forwards`,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </ActivityShell>
  );
}
