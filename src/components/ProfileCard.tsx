"use client";

import { useState } from "react";
import type { ChildProfile, Difficulty } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface Props {
  profile: ChildProfile;
  onChange: (next: ChildProfile) => void;
}

const difficulties: { id: Difficulty; label: string; emoji: string }[] = [
  { id: "muy_facil", label: "Muy fácil", emoji: "🐣" },
  { id: "facil", label: "Fácil", emoji: "🐰" },
  { id: "medio", label: "Medio", emoji: "🦊" },
  { id: "dificil", label: "Difícil", emoji: "🦁" },
];

export function ProfileCard({ profile, onChange }: Props) {
  const [newLike, setNewLike] = useState("");

  const addLike = () => {
    const v = newLike.trim();
    if (!v) return;
    if (profile.likes.includes(v)) return;
    onChange({ ...profile, likes: [...profile.likes, v] });
    setNewLike("");
  };

  const removeLike = (l: string) => {
    onChange({ ...profile, likes: profile.likes.filter((x) => x !== l) });
  };

  return (
    <section className="rounded-3xl border-4 border-rose-300 bg-rose-50 p-5 shadow-lg">
      <h2 className="mb-3 text-xl font-extrabold text-rose-700">
        🧒 Perfil del peque
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col text-sm font-semibold text-slate-700">
          Nombre
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            placeholder="Por ejemplo: Mateo"
            className="mt-1 rounded-xl border-2 border-rose-200 bg-white p-2 text-base font-normal"
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-700">
          Edad
          <input
            type="number"
            min={3}
            max={12}
            value={profile.age}
            onChange={(e) =>
              onChange({
                ...profile,
                age: Math.max(3, Math.min(12, Number(e.target.value) || 6)),
              })
            }
            className="mt-1 rounded-xl border-2 border-rose-200 bg-white p-2 text-base font-normal"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Le gusta</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.likes.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => removeLike(l)}
              className="rounded-full bg-rose-200 px-3 py-1 text-sm font-medium text-rose-900 hover:bg-rose-300"
              title="Quitar"
            >
              {l} ✕
            </button>
          ))}
          {profile.likes.length === 0 ? (
            <span className="text-sm text-slate-500 italic">
              dinosaurios, fútbol, unicornios...
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLike}
            onChange={(e) => setNewLike(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLike()}
            placeholder="Agrega un gusto"
            className="flex-1 rounded-xl border-2 border-rose-200 bg-white p-2"
          />
          <button
            type="button"
            onClick={addLike}
            className="rounded-xl bg-rose-500 px-4 py-2 font-bold text-white shadow hover:bg-rose-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Dificultad</p>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange({ ...profile, difficulty: d.id })}
              className={cn(
                "rounded-2xl border-2 px-3 py-2 text-sm font-bold",
                profile.difficulty === d.id
                  ? "border-rose-500 bg-rose-200 text-rose-900"
                  : "border-rose-200 bg-white text-slate-700 hover:bg-rose-100",
              )}
            >
              <span className="mr-1">{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3 text-sm font-semibold text-slate-700">
        <span>🔥 Racha: {profile.streak}</span>
        <span>
          ✅ {profile.totalCorrect}/{profile.totalAttempted}
        </span>
      </div>
    </section>
  );
}
