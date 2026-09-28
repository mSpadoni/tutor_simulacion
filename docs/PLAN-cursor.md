# PLAN — Tutor de Simulación (Challenge Gleni: AI Tool-Calling & Integration)

## 0. Resumen y decisiones ya tomadas

Un chatbot tutor de **Simulación** (UTN-FRBA) que resuelve f.d.p. y los
ejercicios que le pasa el alumno, genera ejercicios nuevos para practicar y
dibuja los diagramas de flujo como imagen.

**Entrega: viernes 2/10 a las 18:00.** Meta interna: entregar a las 16:00.

| Decisión                         | Elegido                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Challenge                        | **AI Tool-Calling & Integration** (Gleni)                                                                 |
| LLM                              | **OpenAI** (`gpt-4o-mini`) vía **Vercel AI SDK**, en desarrollo y en la entrega, como exige el enunciado. |
| Framework                        | **Next.js** (App Router) + TypeScript, deploy en Vercel                                                   |
| Capacidades LLM (mín. 2)         | **Interpretación de intención** + **Generación de respuesta**                                             |
| API externa obligatoria (Tool A) | **Kroki.io**: código Mermaid → SVG del diagrama de flujo. Sin API key.                                    |
| Tool B (lógica interna)          | `verificar_fdp`: verificación numérica de una f.d.p.                                                      |
| Tool C (persistencia)            | `generar_ejercicio`: ejercicio nuevo en JSON validado con Zod, guardado en Supabase                       |
| Persistencia                     | **Supabase**: conversaciones, mensajes, ejercicios (y feedback, opcional)                                 |
| Auth                             | Google vía **Supabase Auth** (ya hecho)                                                                   |
| Arquitectura                     | **MVC**: `backend/models`, `backend/controllers`, `views/`; `app/` solo rutas                             |
| Bonus features (elegir 2+)       | **Testing**, **Accesibilidad**, **Streaming**                                                             |
| Bonus valorado extra             | **Panel de debug** (tools llamadas, input/output, tokens)                                                 |
| Repo y deploy                    | GitHub `mSpadoni/tutor_simulacion`; Vercel despliega solo cada push a `main`                              |

> **Nota de frontend:** la sección 12 aplica las clases de UX/Accesibilidad de
> la cátedra (clases 4, 8, 9, 11 y 12) al chat, la sidebar y el panel de debug.

### Forma de trabajo

1. Se propone cada cambio y Mateo lo revisa/corrige **antes** de implementarlo.
2. Cada cambio lleva su **test sin mocks** (Supabase local en Docker, HTTP real a Kroki y al LLM).
3. `npm test` → `npm run format` (Prettier) → commit atómico con mensaje descriptivo → push.

---

## 1. Qué es (va al README)

- **Problema:** practicar Simulación es difícil: hay pocos ejercicios
  resueltos, no hay forma de chequear si una f.d.p. está bien, y los
  diagramas de flujo llevan mucho tiempo.
- **Público objetivo:** estudiantes de Simulación (UTN).
- **Propuesta de valor:** resuelve paso a paso, **verifica numéricamente** lo
  que resuelve, genera ejercicios nuevos y dibuja el diagrama de flujo.

---

## 2. Stack técnico

| Pieza        | Elección                                                     | Por qué                                                         |
| ------------ | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Framework    | Next.js (App Router) + TypeScript                            | Deploy en Vercel sin configurar nada                            |
| IA           | **Vercel AI SDK** (`ai` + `@ai-sdk/openai`) con OpenAI       | Streaming, tool calling y `useChat` listos                      |
| Validación   | Zod                                                          | Inputs de las tools, JSON de ejercicios, input del alumno       |
| Matemática   | `mathjs` + `react-markdown` + `remark-math` + `rehype-katex` | Evaluar f(x) en el backend y mostrar fórmulas bien renderizadas |
| Diagramas    | Kroki (API externa) con Mermaid                              | Tool A                                                          |
| Auth + datos | Supabase (Google + `supabase-js`, RLS)                       | Ya armado                                                       |
| Estilos      | Tailwind CSS                                                 | Ya armado; tokens según 12.3                                    |
| Tests        | Vitest, sin mocks (+ Playwright si sobra tiempo)             | Bonus de testing                                                |

---

## 3. Estructura del repo (MVC)

```
app/                          Rutas. page.tsx compone vistas; route.ts delega en un controller.
  api/chat/route.ts           POST del chat (streaming)
  auth/                       Login con Google (ya hecho)
views/                        Componentes React. No acceden a la base.
  chat/                       ChatWindow, MessageBubble (Markdown + KaTeX + SVG), MessageInput
  ConversationSidebar.tsx     Conversaciones y "Mis ejercicios"
  DebugPanel.tsx              Tools llamadas, input/output, tokens
backend/
  controllers/                AuthController, ChatController (loop de tools con el AI SDK)
  models/                     Conversacion, Mensaje, Ejercicio, MaterialCatedra, Usuario
  tools/                      generarDiagramaFlujo, verificarFdp, generarEjercicio, listarMisEjercicios
  lib/                        Cliente LLM, cliente Kroki, Supabase, prompts
  knowledge/                  Base de conocimiento + fichas de la cátedra
  supabase/migrations/        SQL con RLS
  tests/                      Tests sin mocks
```

Dependencias siempre hacia abajo: `app → controllers → (tools, models) → lib`, y `app → views`.

---

## 4. Modelo de datos (Supabase, todas las tablas con RLS por alumno)

```sql
conversaciones (id uuid pk, usuario_id uuid → auth.users, titulo text, creado_en timestamptz)
mensajes       (id uuid pk, conversacion_id uuid → conversaciones on delete cascade,
                rol text, partes jsonb, creado_en timestamptz)
ejercicios     (id uuid pk, usuario_id uuid → auth.users, tema text, dificultad text,
                payload jsonb, creado_en timestamptz)
feedback       (mensaje_id uuid → mensajes, valor smallint)   -- opcional
```

- `mensajes.partes` guarda las `parts` del AI SDK, incluidas las tool calls:
  el historial se recarga completo (texto, diagramas y verificaciones).
- `ejercicios` reemplaza a `ejercicios_historial` (Día 1): lo llena la tool
  `generar_ejercicio` y lo lee `listar_mis_ejercicios`.
- **Nota de AI (12.1):** en la UI, `tema` y `dificultad` nunca se muestran
  tal cual (`transformada_inversa`) sino con rótulos del alumno
  ("Transformada inversa").

---

## 5. Tools (function calling nativo) — el "anti-wrapper"

El LLM elige la tool según lo que pide el alumno: esa elección **es** la
capacidad de interpretación de intención, y se muestra en la UI con un
badge ("Resolviendo f.d.p.", "Generando ejercicio", "Dibujando diagrama").

| Tool                               | Qué hace                                                                                                                        | Criterio técnico que demuestra                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **`generar_diagrama_flujo`** (A)   | El LLM escribe el Mermaid → se valida largo y sintaxis básica → POST a Kroki → devuelve el SVG                                  | Timeout de 8 s (`AbortController`), 1 reintento, manejo de 4xx/5xx/429, validación de la respuesta, cita "Renderizado con Kroki" |
| **`verificar_fdp`** (B)            | Recibe f(x), dominio y parámetros. Con `mathjs` + Simpson chequea ∫f = 1 y f ≥ 0; calcula E[X], V[X] y F(x) en algunos puntos   | **Lógica de negocio después del LLM:** el LLM resuelve simbólicamente y la tool confirma; si no coincide, el LLM corrige         |
| **`generar_ejercicio`** (C)        | Devuelve `{tema, dificultad, enunciado, datos, solucion_pasos[], respuesta_final}` validado con Zod y lo guarda en `ejercicios` | Output estructurado + persistencia                                                                                               |
| `listar_mis_ejercicios` (opcional) | Lee de Supabase los ejercicios guardados del alumno                                                                             | Memoria entre sesiones                                                                                                           |

**Nota de UI (12.2):** cada invocación se muestra en el `DebugPanel` con el
nombre en lenguaje llano, el input y el resultado — es el bonus valorado del
challenge y la heurística #1 de Nielsen (visibilidad del estado).

**Accesibilidad del diagrama:** el SVG de Kroki va con `alt` descriptivo y un
botón "Ver como texto" que muestra el Mermaid (WCAG 1.1.1).

---

## 6. System prompt y contexto de la materia

- **Base de conocimiento** entera en el system prompt (convenciones de la cátedra).
- **Fichas de la cátedra** (BM25 en `MaterialCatedra`, ya hecho), de dos tipos
  que cada archivo declara con `> tipo:`:
  - **Modelos** (guía oficial 1 a 8, clases, TP 4): para explicar teoría;
    nunca se dan como ejercicio.
  - **Ejercicios** (Guía Anexa resuelta y 2026, parciales, ejercicios
    resueltos, guía oficial 9 a 12): el tipo de ejercicio para practicar y
    la referencia de redacción y complejidad para inventar uno nuevo.
  - El modelo pide el material con tools: `consultar_modelos` (teoría; también
    para resolver y corregir), `buscar_ejercicio` (enunciado + resolución de la
    cátedra como referencia a contrastar con la teoría, porque algunas tienen
    errores) e `inspiracion_para_ejercicio` (para crear uno nuevo desde cero). Lo de Δt
    y la guía 13 en adelante quedan en `pendientes.md`, sin cargar. Sin
    embeddings ni base vectorial.
- **Ejercicios nuevos:** redactados como la anexa y los parciales (sección 8
  de la base de conocimiento), solo de sistemas de Evento a Evento pero **sin
  decir nunca la metodología**: elegirla es parte del ejercicio.
- **Few-shot:** 3–4 ejemplos resueltos al estilo de la cátedra (f.d.p.,
  ejercicio nuevo, corrección, diagrama), fijos en el prompt.
- **Cuándo usar cada tool:** `verificar_fdp` siempre que se resuelva una
  f.d.p.; `generar_diagrama_flujo` solo cuando se pide o corresponde un
  diagrama; `generar_ejercicio` al pedir práctica; `listar_mis_ejercicios`
  cuando el alumno pregunta por lo que ya practicó.
- Mantiene las reglas del tutor ya definidas (no dar la solución de un
  ejercicio nuevo salvo que la pida, corregir de a un error, marcar el error
  principal con `> ⚠`).

---

## 7. Roadmap (lunes 28/9 → viernes 2/10)

| Día              | Foco                                                                                                                                                                      | Hito                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **1 (lun 28/9)** | Repo, Next.js, login de Supabase, tablas con RLS (`conversaciones`, `mensajes`, `ejercicios`), `.env.example`, **primer deploy en Vercel**                                | Login andando en producción |
| **2 (mar 29/9)** | Chat con `useChat` y **streaming** (AI SDK), persistencia de conversaciones y mensajes, sidebar, system prompt con base + fichas + few-shot                               | Chat que recuerda historial |
| **3 (mié 30/9)** | Las 3 tools con Zod, cliente de Kroki con timeouts y reintento, render de KaTeX y SVG, panel de debug                                                                     | Las 3 capacidades andando   |
| **4 (jue 1/10)** | Estados de carga/error, chips, accesibilidad, tests (`verificar_fdp` con distribuciones conocidas, schemas Zod, Kroki real: timeout y errores), evaluación con compañeros | Feature freeze a la noche   |
| **5 (vie 2/10)** | Hasta las 15: README completo, capturas/GIF, video de 2–3 min, revisar variables en Vercel                                                                                | **Entregar a las 16**       |

---

## 8. User stories (mínimo 3)

1. **Como** estudiante **quiero** pegar una f.d.p. y obtener k, F(x), E[X] y la inversa **para** saber si mi resolución está bien.
   - [ ] Pasos en LaTeX
   - [ ] Verificación numérica visible
   - [ ] Aviso si f(x) no es una f.d.p. válida
2. **Como** estudiante **quiero** pedir ejercicios nuevos de un tema y dificultad **para** practicar antes del parcial.
   - [ ] JSON validado
   - [ ] Se guarda en "Mis ejercicios"
   - [ ] La solución está oculta hasta que la pido
3. **Como** estudiante **quiero** el diagrama de flujo de un modelo de simulación **para** no dibujarlo a mano.
   - [ ] Imagen renderizada
   - [ ] Alternativa en texto
   - [ ] Error claro con opción de reintentar si Kroki falla

---

## 9. README — checklist

- [ ] Descripción, problema, público y propuesta de valor (sección 1)
- [ ] User stories (sección 8)
- [ ] Instalación local
- [ ] Arquitectura MVC y decisiones técnicas: por qué Kroki, por qué `verificar_fdp`, estrategia de prompt (base + fichas BM25 + few-shot), manejo de errores y edge cases, decisiones de UX (sección 12)
- [ ] Capturas o GIFs del chat, la sidebar y el panel de debug
- [ ] Features bonus: testing, accesibilidad (puntaje de Lighthouse/axe), streaming, panel de debug
- [ ] Evaluación heurística + test con 2–3 compañeros (eficacia, eficiencia, satisfacción)
- [ ] Limitaciones conocidas y mejoras futuras (sección 10)

---

## 10. Riesgos y mejoras futuras

**Riesgos:**

- **El LLM se equivoca en cálculos.** Lo mitiga `verificar_fdp`; se documenta como limitación y como decisión técnica.
- **Kroki se cae.** Fallback: mostrar el Mermaid y un link a mermaid.live.
- **Poco tiempo.** Se recorta en este orden: feedback → `listar_mis_ejercicios` → Playwright. Nunca el deploy ni el README.
- **API key de OpenAI:** vive solo en `.env.local` y en Vercel; nunca en el repo público.
- **App de Google en modo Testing** o **Supabase pausado** el día de la evaluación (ver Día 1).

**Mejoras futuras:** corregir fotos/PDF del diagrama del alumno (visión, con
confirmación de lo leído antes de corregir), feedback 👍/👎 por respuesta,
rate limiting, ejercicios de Δt.

---

## 11. Variables de entorno (.env.example)

```
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Kroki no necesita key. Las credenciales de Google van en Supabase, no acá.

---

## 12. Frontend / UX-UI — aplicando las clases de la cátedra

El criterio "Producto" (35%) pesa lo mismo que "Ingeniería" (35%): esto no es
cosmético, es un tercio de la nota.

### 12.1 Arquitectura de la Información (Clase 8)

- **Objetos de la interfaz:** sidebar izquierda ("Conversaciones" y "Mis
  ejercicios"), chat en el centro, panel de debug plegable a la derecha. Tres
  objetos con propósitos distintos, sin mezclarlos.
- **Organización:** primer nivel por tarea (resolver f.d.p., ejercicio nuevo,
  diagrama de flujo, consulta); "Mis ejercicios" por tema y en orden
  cronológico (el más reciente arriba).
- **Rotulado en el vocabulario del alumno:** "Resolver f.d.p.", no "Invocar
  tool"; "Transformada inversa", no `transformada_inversa`.
- **Divulgación progresiva:** la solución de un ejercicio generado queda
  oculta detrás de "Ver solución"; el panel de debug arranca plegado.

### 12.2 Accesibilidad — WCAG 2.x nivel AA (Clase 4)

- **HTML semántico:** `<header>`, `<nav>` (sidebar), `<main>` (chat),
  `<aside>` (debug). Un solo `<h1>`.
- **Teclado:** todo usable sin mouse, foco visible siempre, **skip link "Ir
  al chat"**.
- **Formularios:** `<label>` visible en el input; errores con `aria-invalid`
  y `aria-describedby`.
- **Streaming accesible:** una región `aria-live="polite"` anuncia la
  respuesta **cuando termina**, no cada token.
- **Botones solo con ícono** (detener, reintentar, plegar panel) con `aria-label`.
- **Contraste AA** (4.5:1) verificado.
- **`prefers-reduced-motion`** respetado.
- **Diagramas** con `alt` y "Ver como texto"; **fórmulas** KaTeX con MathML.
- Auditar con **Lighthouse y axe DevTools** y poner el puntaje en el README.

### 12.3 Patrones de UI y sistema de diseño mínimo (Clases 9 y 11)

- **Layout tipo ChatGPT** (patrón conocido, KISS). En mobile, sidebar y panel
  de debug pasan a **Drawer** detrás de botones con texto.
- **Pantalla vacía con 3 chips** (reconocer antes que recordar): "Resolvé
  esta f.d.p.", "Dame un ejercicio de transformada inversa", "Diagrama de
  flujo evento a evento".
- **Estados diferenciados** (no solo por color): pensando, "Llamando a
  Kroki…", error con "Reintentar", éxito.
- **Control del usuario:** "Detener generación", reintentar ante error,
  confirmación antes de borrar una conversación.
- **Prevención de errores:** no se envía vacío, límite de caracteres con
  contador, Enter envía y Shift+Enter hace salto de línea.
- **Mensajes de error útiles:** "No pude generar el diagrama (el servicio
  tardó demasiado). Reintentar", nunca un stack trace.
- **Leyes de diseño:** Fitts (botón enviar grande, abajo), Hick (pocas
  opciones a la vez), Miller (listas de ejercicios agrupadas/paginadas),
  von Restorff (el error principal `> ⚠` se destaca con borde, fondo e ícono).
- **Tokens:** tipografía sans serif, interlineado 1.5, color 60/30/10, colores
  de feedback semánticos siempre con texto o ícono.

### 12.4 Evaluación de producto (Clase 12)

- **Evaluación heurística** propia con las 10 de Nielsen sobre el chat.
- **Test rápido con 2–3 compañeros** midiendo eficacia (tareas logradas),
  eficiencia (tiempo/pasos) y satisfacción.
- Los hallazgos van al README ("Decisiones" o "Limitaciones conocidas").
