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
  MiniAppActivity,
  type MiniAppActivityArgs,
} from "@/components/MiniAppActivity";
import {
  FractionPieActivity,
  type FractionPieActivityArgs,
} from "@/components/FractionPieActivity";
import {
  CompareScaleActivity,
  type CompareScaleActivityArgs,
} from "@/components/CompareScaleActivity";
import {
  ColorMixerActivity,
  type ColorMixerActivityArgs,
} from "@/components/ColorMixerActivity";
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

  useHumanInTheLoop({
    name: "presentFractionPie",
    description:
      "Pizza/pie fraccionable. El niño hace clic en porciones para llenar hasta llegar a la fracción objetivo. Úsala para enseñar fracciones simples (1/2, 3/4, 2/3, etc).",
    parameters: z.object({
      prompt: z
        .string()
        .describe("Frase corta. Ej: 'Haz la fracción 3 de 4 🍕'"),
      denominator: z
        .number()
        .min(2)
        .max(12)
        .describe("Total de porciones (2-12)"),
      expectedNumerator: z
        .number()
        .describe("Cuántas porciones debe llenar (0..denominator)"),
      emoji: z
        .string()
        .optional()
        .describe("Emoji del título. Default 🍕"),
    }),
    render: ({ args, status, respond }) => (
      <FractionPieActivity
        args={args as Partial<FractionPieActivityArgs>}
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

  useHumanInTheLoop({
    name: "presentCompareScale",
    description:
      "Balanza visual con dos grupos de objetos. El niño elige <, =, > según cuál pesa más. Úsala para enseñar comparación de cantidades, mayor/menor, igualdad.",
    parameters: z.object({
      prompt: z
        .string()
        .describe("Frase corta. Ej: '¿Cuál grupo tiene más?'"),
      leftCount: z.number().min(0).max(15),
      leftEmoji: z
        .string()
        .describe("Un solo emoji para el grupo izquierdo. Ej '🍎'"),
      rightCount: z.number().min(0).max(15),
      rightEmoji: z
        .string()
        .describe("Un solo emoji para el grupo derecho. Ej '🍌'"),
    }),
    render: ({ args, status, respond }) => (
      <CompareScaleActivity
        args={args as Partial<CompareScaleActivityArgs>}
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

  useHumanInTheLoop({
    name: "presentColorMixer",
    description:
      "Mezclador de colores primarios (rojo, azul, amarillo). El niño activa primarios y descubre el secundario. Si pasas expectedColor, es un quiz. Sin él, es exploración libre.",
    parameters: z.object({
      prompt: z
        .string()
        .describe("Frase corta. Ej: '¿Qué sale al mezclar rojo y amarillo?'"),
      expectedColor: z
        .string()
        .optional()
        .describe(
          "Color esperado (quiz). Valores válidos: rojo, azul, amarillo, naranja, verde, morado, marrón, blanco. Omitir para modo exploración.",
        ),
    }),
    render: ({ args, status, respond }) => (
      <ColorMixerActivity
        args={args as Partial<ColorMixerActivityArgs>}
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

  useHumanInTheLoop({
    name: "presentMiniApp",
    description:
      "Crea una mini-app interactiva en MODO APP (pantalla completa) para explicar un tema cuando ninguna otra herramienta encaja. ANTES de llamarla pregunta 1-2 cosas cortas para definirla. Construye 1-3 controles muy simples (slider/button/toggle/picker) y un reactionTemplate con {{idDelControl}} que se actualiza en vivo.",
    parameters: z.object({
      title: z
        .string()
        .describe("Título corto, ej. 'Cómo crece una planta 🌱'"),
      intro: z
        .string()
        .describe("1-2 frases muy simples explicando qué pueden explorar"),
      scene: z
        .string()
        .optional()
        .describe("Línea de emojis decorativa (opcional)"),
      controls: z
        .array(
          z.object({
            kind: z
              .enum(["slider", "button", "toggle", "picker"])
              .describe("Tipo de control"),
            id: z
              .string()
              .describe(
                "Identificador único, sin espacios. Para reactionTemplate.",
              ),
            label: z.string().describe("Etiqueta corta visible"),
            emoji: z.string().optional(),
            // slider
            min: z.number().optional().describe("(slider) mínimo"),
            max: z.number().optional().describe("(slider) máximo"),
            step: z.number().optional().describe("(slider) paso"),
            initialNumber: z
              .number()
              .optional()
              .describe("(slider) valor inicial"),
            unit: z.string().optional().describe("(slider) unidad opcional"),
            // button
            targetVar: z
              .string()
              .optional()
              .describe(
                "(button) variable que se incrementa al pulsar — usable en reactionTemplate",
              ),
            delta: z
              .number()
              .optional()
              .describe("(button) cuánto suma cada pulsada"),
            // toggle
            onLabel: z.string().optional().describe("(toggle) texto cuando ON"),
            offLabel: z
              .string()
              .optional()
              .describe("(toggle) texto cuando OFF"),
            initialOn: z
              .boolean()
              .optional()
              .describe("(toggle) inicia ON"),
            // picker
            options: z
              .array(
                z.object({
                  label: z.string(),
                  value: z.string(),
                  emoji: z.string().optional(),
                }),
              )
              .optional()
              .describe("(picker) 2-6 opciones"),
            initialValue: z
              .string()
              .optional()
              .describe("(picker) value inicial"),
          }),
        )
        .min(1)
        .max(4)
        .describe("1-4 controles. SIEMPRE define al menos uno."),
      bands: z
        .array(
          z.object({
            when: z
              .array(
                z.object({
                  controlId: z
                    .string()
                    .describe("id literal de un control existente"),
                  min: z.number().optional().describe("≥ inclusive"),
                  max: z.number().optional().describe("≤ inclusive"),
                  equals: z
                    .string()
                    .optional()
                    .describe(
                      "valor exacto (picker: el value; toggle: 'true'|'false')",
                    ),
                }),
              )
              .min(1),
            status: z.enum(["great", "good", "warning", "danger"]),
            message: z.string().describe("Frase corta de qué pasa"),
            emoji: z.string().describe("1-2 emojis grandes"),
            healthPct: z
              .number()
              .min(0)
              .max(100)
              .describe("Salud 0-100 para la barra"),
            detail: z
              .string()
              .describe("Dato real/explicación factual breve"),
          }),
        )
        .min(3)
        .max(8)
        .describe(
          "🚨 OBLIGATORIO: 3-8 zonas de simulación con datos REALES. SIN bands la app no enseña nada y es inútil. Ordena de más restrictiva (lethal/danger primero) a más amplia. La PRIMERA banda cuyas condiciones matchean gana.",
        ),
      reactionTemplate: z
        .string()
        .optional()
        .describe(
          "Texto reactivo opcional. Si lo usas DEBE contener {{idDelControl}} con un id EXACTO de un control. Es secundario a bands; usa bands para consecuencias reales y reactionTemplate solo para narración ligera.",
        ),
      finishLabel: z
        .string()
        .optional()
        .describe("Texto del botón de salida"),
    }),
    render: ({ args, status, respond }) => {
      // Debug: log lo que el agente generó. Quita esto cuando esté estable.
      if (typeof window !== "undefined") {
        console.log("[presentMiniApp args]", args);
      }
      return (
        <MiniAppActivity
          args={args as Partial<MiniAppActivityArgs>}
          status={status === "complete" ? "complete" : "executing"}
          respond={(result) => {
            try {
              respond?.(JSON.parse(result));
            } catch {
              respond?.({ raw: result });
            }
          }}
        />
      );
    },
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
