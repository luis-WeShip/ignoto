"use client";

import { useMemo, useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { cn } from "@/lib/utils";

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchPairsActivityArgs {
  prompt: string;
  pairs: MatchPair[];
}

interface Props {
  args: Partial<MatchPairsActivityArgs>;
  status: "executing" | "complete" | "inProgress";
  respond?: (result: string) => void;
}

type Card = { id: string; pairId: number; text: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchPairsActivity({ args, status, respond }: Props) {
  const prompt = args.prompt ?? "Empareja los que van juntos";
  const rawPairs = (args.pairs ?? []).slice(0, 4);

  const cards = useMemo<Card[]>(() => {
    const list: Card[] = [];
    rawPairs.forEach((p, i) => {
      list.push({ id: `L${i}`, pairId: i, text: p.left });
      list.push({ id: `R${i}`, pairId: i, text: p.right });
    });
    return shuffle(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<[string, string] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);

  const totalPairs = rawPairs.length;

  const onPick = (card: Card) => {
    if (done || matched.has(card.pairId)) return;
    if (wrongFlash) return;

    if (!picked) {
      setPicked(card.id);
      return;
    }
    if (picked === card.id) {
      setPicked(null);
      return;
    }

    setAttempts((a) => a + 1);
    const prevCard = cards.find((c) => c.id === picked)!;
    if (prevCard.pairId === card.pairId) {
      const next = new Set(matched);
      next.add(card.pairId);
      setMatched(next);
      setPicked(null);
      if (next.size === totalPairs) {
        setDone(true);
        respond?.(
          JSON.stringify({
            activity: "match_pairs",
            attempts: attempts + 1,
            totalPairs,
            correct: true,
          }),
        );
      }
    } else {
      setWrongFlash([prevCard.id, card.id]);
      setTimeout(() => {
        setWrongFlash(null);
        setPicked(null);
      }, 600);
    }
  };

  const giveUp = () => {
    if (done) return;
    setDone(true);
    respond?.(
      JSON.stringify({
        activity: "match_pairs",
        attempts,
        matched: matched.size,
        totalPairs,
        correct: matched.size === totalPairs,
        gaveUp: true,
      }),
    );
  };

  return (
    <ActivityShell title={prompt} emoji="🧩" status={status}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map((c) => {
          const isPicked = picked === c.id;
          const isMatched = matched.has(c.pairId);
          const isWrong = wrongFlash?.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={done || isMatched}
              onClick={() => onPick(c)}
              className={cn(
                "min-h-20 rounded-2xl border-4 p-3 text-base font-bold shadow",
                "transition-transform hover:scale-[1.03] active:scale-95",
                "border-indigo-300 bg-indigo-50",
                isPicked && "border-indigo-500 ring-4 ring-indigo-300 bg-white",
                isMatched && "border-green-400 bg-green-100 opacity-80",
                isWrong && "border-red-400 bg-red-100 animate-pulse",
              )}
            >
              {c.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">
          {matched.size}/{totalPairs} parejas · {attempts} intentos
        </span>
        {!done ? (
          <button
            type="button"
            onClick={giveUp}
            className="text-xs text-slate-500 underline"
          >
            Suficiente
          </button>
        ) : (
          <span className="text-sm font-bold">
            {matched.size === totalPairs ? "🎉 ¡Todas!" : "💡 Sigamos otra"}
          </span>
        )}
      </div>
    </ActivityShell>
  );
}
