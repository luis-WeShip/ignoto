"use client";

import { useCallback, useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import {
  useAgentContext,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { ProfileCard } from "@/components/ProfileCard";
import {
  CountingActivity,
  type CountingActivityArgs,
} from "@/components/CountingActivity";
import {
  QuizActivity,
  type QuizActivityArgs,
} from "@/components/QuizActivity";
import {
  SumBlocksActivity,
  type SumBlocksActivityArgs,
} from "@/components/SumBlocksActivity";
import {
  SubtractBlocksActivity,
  type SubtractBlocksActivityArgs,
} from "@/components/SubtractBlocksActivity";
import {
  StoryPageActivity,
  type StoryPageActivityArgs,
} from "@/components/StoryPageActivity";
import {
  MatchPairsActivity,
  type MatchPairsActivityArgs,
} from "@/components/MatchPairsActivity";
import {
  initialProfile,
  type ChildProfile,
  type Difficulty,
} from "@/lib/profile";

function App() {
  const [profile, setProfile] = useState<ChildProfile>(initialProfile);

  // Sólo campos estables (los que cambian rara vez), para no churn-ear el contexto
  useAgentContext({
    description:
      "Perfil del niño con quien estás interactuando. Adapta dificultad y temas a sus gustos.",
    value: {
      name: profile.name,
      age: profile.age,
      likes: profile.likes,
      difficulty: profile.difficulty,
    },
  });

  const recordResult = useCallback((correct: boolean) => {
    setProfile((prev) => ({
      ...prev,
      totalAttempted: prev.totalAttempted + 1,
      totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0,
    }));
  }, []);

  // ---------- profile ----------
  useFrontendTool({
    name: "updateChildProfile",
    description:
      "Actualiza el perfil del niño. Usa addLikes cuando descubras un gusto. Cambia difficulty para subir/bajar.",
    parameters: z.object({
      name: z.string().optional(),
      age: z.number().optional(),
      addLikes: z.array(z.string()).optional().describe("Gustos a agregar."),
      removeLikes: z.array(z.string()).optional(),
      difficulty: z
        .enum(["muy_facil", "facil", "medio", "dificil"])
        .optional(),
    }),
    handler: async ({ name, age, addLikes, removeLikes, difficulty }) => {
      setProfile((prev) => {
        const next: ChildProfile = { ...prev };
        if (typeof name === "string" && name.trim()) next.name = name.trim();
        if (typeof age === "number" && age >= 3 && age <= 12) next.age = age;
        if (Array.isArray(addLikes)) {
          const set = new Set(next.likes);
          for (const l of addLikes) if (l && typeof l === "string") set.add(l);
          next.likes = Array.from(set);
        }
        if (Array.isArray(removeLikes)) {
          const set = new Set(removeLikes);
          next.likes = next.likes.filter((l) => !set.has(l));
        }
        if (difficulty) {
          next.difficulty = difficulty as Difficulty;
        }
        return next;
      });
      return "ok";
    },
  });

  // ---------- ACTIVITIES (HITL) ----------
  useHumanInTheLoop({
    name: "presentCounting",
    description:
      "Muestra N copias de un emoji para que el niño cuente. Espera su respuesta.",
    parameters: z.object({
      prompt: z.string(),
      emoji: z.string().describe("Un único emoji a repetir"),
      count: z.number(),
      expectedAnswer: z.number(),
    }),
    render: ({ args, status, respond }) => (
      <CountingActivity
        args={args as Partial<CountingActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            const parsed = JSON.parse(result) as { correct?: boolean };
            recordResult(!!parsed.correct);
            respond?.(parsed);
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  useHumanInTheLoop({
    name: "presentQuiz",
    description:
      "Pregunta de opción múltiple ilustrada. Espera la respuesta del niño.",
    parameters: z.object({
      question: z.string(),
      options: z
        .array(
          z.object({
            label: z.string(),
            emoji: z.string().optional(),
          }),
        )
        .min(2)
        .max(4),
      correctIndex: z.number(),
    }),
    render: ({ args, status, respond }) => (
      <QuizActivity
        args={args as Partial<QuizActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            const parsed = JSON.parse(result) as { correct?: boolean };
            recordResult(!!parsed.correct);
            respond?.(parsed);
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  useHumanInTheLoop({
    name: "presentSumBlocks",
    description: "Suma visual: dos grupos de bloques, el niño escribe el total.",
    parameters: z.object({
      leftCount: z.number(),
      rightCount: z.number(),
      emoji: z.string(),
      prompt: z.string().optional(),
    }),
    render: ({ args, status, respond }) => (
      <SumBlocksActivity
        args={args as Partial<SumBlocksActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            const parsed = JSON.parse(result) as { correct?: boolean };
            recordResult(!!parsed.correct);
            respond?.(parsed);
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  useHumanInTheLoop({
    name: "presentSubtractBlocks",
    description:
      "Resta visual: muestra `total` bloques y `takeAway` se quitan. El niño escribe cuántos quedan.",
    parameters: z.object({
      total: z.number(),
      takeAway: z.number(),
      emoji: z.string(),
      prompt: z.string().optional(),
    }),
    render: ({ args, status, respond }) => (
      <SubtractBlocksActivity
        args={args as Partial<SubtractBlocksActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            const parsed = JSON.parse(result) as { correct?: boolean };
            recordResult(!!parsed.correct);
            respond?.(parsed);
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  useHumanInTheLoop({
    name: "presentMatchPairs",
    description:
      "Emparejar 2-4 pares revueltos (vocabulario, animal-cría, número-cantidad).",
    parameters: z.object({
      prompt: z.string(),
      pairs: z
        .array(
          z.object({
            left: z.string(),
            right: z.string(),
          }),
        )
        .min(2)
        .max(4),
    }),
    render: ({ args, status, respond }) => (
      <MatchPairsActivity
        args={args as Partial<MatchPairsActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            const parsed = JSON.parse(result) as { correct?: boolean };
            recordResult(!!parsed.correct);
            respond?.(parsed);
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  useHumanInTheLoop({
    name: "presentStory",
    description:
      "Mini página de cuento: emojiArt + 1-2 frases de texto + 2-3 elecciones. Personaliza con sus gustos.",
    parameters: z.object({
      scene: z.string(),
      emojiArt: z.string(),
      text: z.string(),
      choices: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            emoji: z.string().optional(),
          }),
        )
        .min(2)
        .max(3),
    }),
    render: ({ args, status, respond }) => (
      <StoryPageActivity
        args={args as Partial<StoryPageActivityArgs>}
        status={status === "complete" ? "complete" : "executing"}
        respond={(result) => {
          try {
            respond?.(JSON.parse(result));
          } catch {
            respond?.({ raw: result });
          }
        }}
      />
    ),
  });

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
          🎈 Ignoto
        </h1>
        <p className="text-slate-600">Aprende jugando con tu tutor IA</p>
      </header>

      <ProfileCard profile={profile} onChange={setProfile} />

      <div className="mt-6 rounded-3xl border-4 border-dashed border-sky-300 bg-white/70 p-6 text-center text-slate-600">
        💬 Habla con tu tutor en la barra lateral. Las actividades aparecen
        dentro del chat.
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint={false}>
      <App />
      <CopilotSidebar
        defaultOpen
        clickOutsideToClose={false}
        labels={{
          title: "Tu tutor 🐣",
          initial:
            "¡Hola! 👋 Soy Ignoto. ¿Cómo te llamas y qué te gusta?",
        }}
      />
    </CopilotKit>
  );
}
