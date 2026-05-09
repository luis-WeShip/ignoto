# Ignoto · UI generativa para enseñar a los niños

Tutor con UI generativa construido con **Next.js + CopilotKit + LangChain.js**. El agente decide qué actividad mostrar (contar, quiz, sumar) según el perfil y los gustos del niño, y se adapta a sus respuestas.

## Stack

- Next.js 15 (App Router) · React 19
- CopilotKit `^1.10.4` (`react-core`, `react-ui`, `runtime`)
- LangChain.js (`@langchain/openai`, `@langchain/google-genai`)
- Tailwind v4

## Cómo corre

1. Instala dependencias

   ```bash
   npm install
   ```

2. Copia las variables de entorno

   ```bash
   cp .env.example .env
   ```

   Edita `.env` con tu `OPENAI_API_KEY` y/o `GOOGLE_API_KEY`. Para alternar el proveedor cambia `LLM_PROVIDER` a `openai` o `google`.

3. Arranca

   ```bash
   npm run dev
   ```

   Abre <http://localhost:3000>.

## Cómo funciona

- `src/app/api/copilotkit/route.ts` expone el runtime de CopilotKit con un `LangChainAdapter` que selecciona OpenAI o Gemini según `LLM_PROVIDER`.
- `src/app/page.tsx` configura el agente:
  - `useCopilotReadable` expone el perfil del niño (nombre, edad, gustos, dificultad, racha).
  - `useCopilotAdditionalInstructions` define el system prompt del tutor (personalidad, estilo, reglas de dificultad).
  - `useCopilotAction(... renderAndWaitForResponse ...)` define **3 actividades generativas**: el agente las invoca y el niño interactúa con el componente; cuando responde, el resultado vuelve al agente como salida de la herramienta.
- Componentes en `src/components/`:
  - `CountingActivity.tsx` — conteo de objetos con emojis.
  - `QuizActivity.tsx` — opción múltiple ilustrada.
  - `SumBlocksActivity.tsx` — suma con bloques visuales.

## Cómo agregar una actividad

1. Crea `src/components/MiActivity.tsx` siguiendo el patrón (`args`, `status`, `respond`).
2. Registra en `src/app/page.tsx` un nuevo `useCopilotAction` con `renderAndWaitForResponse`.
3. Documenta la herramienta en el system prompt para que el agente sepa cuándo usarla.

## Notas

- Si Gemini falla con errores de validación de mensajes vacíos, revisa que el modelo configurado sea uno que soporte tools (recomendado `gemini-2.5-flash`).
- El estado del niño vive en React local (`useState`) y se sincroniza al agente vía `useCopilotReadable`. Si quieres persistirlo, mete `localStorage` o un backend.
