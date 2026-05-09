"use client";

import { useCallback, useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import {
  useAgentContext,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { KawaiiBlob } from "@/components/KawaiiBlob";
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
        if (difficulty) next.difficulty = difficulty as Difficulty;
        return next;
      });
      return "ok";
    },
  });

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
        .array(z.object({ label: z.string(), emoji: z.string().optional() }))
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
    description:
      "Suma visual: dos grupos de bloques, el niño escribe el total.",
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
        .array(z.object({ left: z.string(), right: z.string() }))
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

  return null;
}

function DecorativeBlobs() {
  // Decoración de fondo: blobs flotando con animación. Pointer-events-none.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-8 left-6 animate-float opacity-70">
        <KawaiiBlob shape="pentagon" color="var(--sky)" size={88} mood="happy" />
      </div>
      <div
        className="absolute top-16 right-10 animate-float opacity-70"
        style={{ animationDelay: "0.4s" }}
      >
        <KawaiiBlob shape="circle" color="var(--coral)" size={72} mood="wink" />
      </div>
      <div
        className="absolute bottom-24 left-12 animate-float opacity-70"
        style={{ animationDelay: "0.8s" }}
      >
        <KawaiiBlob
          shape="triangle"
          color="var(--mint)"
          size={68}
          mood="sleepy"
        />
      </div>
      <div
        className="absolute bottom-10 right-12 animate-float opacity-70"
        style={{ animationDelay: "1.2s" }}
      >
        <KawaiiBlob
          shape="drop"
          color="var(--accent)"
          size={80}
          mood="smile"
        />
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <header className="flex items-center gap-3 px-5 py-4 border-b-2 border-border bg-card">
      <div className="animate-bounce-slow">
        <KawaiiBlob shape="blob" color="var(--primary)" size={56} mood="star" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-bold leading-none">
          IGNO
        </h1>
        <p className="text-xs text-muted-foreground">
          Tu tutor con superpoderes ✨
        </p>
      </div>
    </header>
  );
}

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint={false}>
      <main className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 bg-background">
        <DecorativeBlobs />

        <div className="relative z-10 w-full max-w-2xl h-[min(900px,calc(100vh-1.5rem))] flex flex-col rounded-3xl border-2 border-border bg-card shadow-soft overflow-hidden animate-pop-in">
          <ChatHeader />
          <div className="flex-1 min-h-0 flex flex-col">
            <App />
            <CopilotChat
              className="flex-1 min-h-0"
              labels={{
                title: "IGNO",
                initial:
                  "¡Hola! 👋 Soy IGNO. ¿Cómo te llamas y qué te gusta?",
              }}
            />
          </div>
        </div>
      </main>
    </CopilotKit>
  );
}
