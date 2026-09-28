# PLAN — Día 2: Chat con streaming y persistencia (sin tools)

> Sección 7 de `PLAN-cursor.md`, Día 2 (mar 29/9): "Chat con `useChat` y
> streaming (AI SDK), persistencia de conversaciones y mensajes, sidebar,
> system prompt con base + fichas + few-shot".

**Objetivo del día:** que el alumno logueado pueda charlar con el tutor
(resolver una f.d.p., pedir un ejercicio, mandar una resolución para
corregir o hacer una consulta teórica), ver la respuesta **token a token**,
y encontrar sus conversaciones guardadas al volver a entrar.

---

## Hecho ✅

### Backend

- [x] `backend/knowledge/base-conocimiento-simulacion.md`: la base de
      conocimiento de la cátedra.
- [x] `backend/lib/prompts/systemPrompt.ts`: instrucciones del tutor + base de
      conocimiento entera (sin embeddings ni base vectorial, sección 6 del plan).
      Incluye los 3 modos (ejercicio nuevo / corrección / consulta teórica),
      corregir de a un error genuino por vez en el orden de la sección 7 de la
      base de conocimiento, mostrar primero qué va a revisar y marcar el error
      principal como `> ⚠ ...`.
- [x] `backend/lib/openai.ts`: cliente de **OpenAI** con timeout de 30 s y un
      reintento. URL y modelo configurables con `OPENAI_BASE_URL` (por
      defecto `https://api.openai.com/v1`) y `OPENAI_MODEL` (por defecto
      `gpt-4o-mini`).
- [x] `backend/models/conversacion.model.ts`: clase `Conversacion`. Valida con
      Zod lo que manda el navegador (roles, mensajes vacíos, máximo 20
      mensajes y 6000 caracteres, el último tiene que ser del alumno) y lo
      traduce al formato de OpenAI.
- [x] `backend/controllers/chat.controller.ts`: clase `ChatController`.
      Traduce los errores de OpenAI a mensajes para el alumno (qué pasó y qué
      hacer), sin detalles técnicos: timeout → 504, demasiadas consultas o
      servicio saturado → 503, configuración → 502.
- [x] `app/api/chat/route.ts`: exige sesión (401), valida (400) y delega en el
      controller.

### Material de la cátedra

- [x] Material de `complemento_teorico/` pasado a fichas en `backend/knowledge/`:
  - `guia-anexa-resuelta.md`: 58 ejercicios con variables y T.E.I. (convertido del .docx
    leyendo sus tablas).
  - `guia-tp-2026.md`: los 22 enunciados de la guía oficial.
  - `ejercicios-resueltos-eae.md`: 8 ejercicios de la cátedra, con diagramas pasados a pasos.
  - `colas-resumen-catedra.md`: N servidores con N colas y con 1 cola, con vaciamiento.
  - `generacion-va-resueltos.md`: TP 4 (inversa y rechazo), con las cuentas reconstruidas.
  - `parciales-anteriores.md`: 6 parciales y los parcialitos 2026 (consignas, sin respuestas).
- [x] Base de conocimiento: sección 9 con lo que toman los parcialitos (HV, ITO/STO,
      vaciamiento, arrepentimiento, permanencia "método viejo" y "nuevo").
- [x] `MaterialCatedra` (BM25): elige hasta 2 modelos y 2 ejercicios por consulta, entre 91 fichas.
      El log `chat.respuesta` registra modelo, tiempo, tokens y fichas usadas.
- [x] **Dos tipos de material** (cada archivo lo declara con `> tipo:`):
  - `modelo`: guía oficial 1 a 8 (`modelos-guia-oficial.md`, por tema: colas y tiempo comprometido),
    clases de colas y TP 4. Sirven para explicar; nunca se dan como ejercicio.
  - `ejercicio`: Guía Anexa resuelta, Guía Anexa 2026 (`guia-anexa-2026.md`, los 8 que no estaban),
    parciales, ejercicios resueltos y guía oficial 9 a 12. Tipo de ejercicio para practicar y
    referencia de redacción.
  - `pendiente` (`pendientes.md`, no se carga): guía oficial 13 a 22 y los 17 de Δt de la anexa.
- [x] **Ejercicios nuevos redactados como la anexa y los parciales** (sección 8 de la base): título,
      relato del sistema, datos con f.d.p., qué se busca decidir y "Se pide:", con complejidad de
      parcial. **Nunca dicen la metodología** ni nombran eventos o variables: lo descubre el alumno.
- [x] Clases oficiales "Clase EaE" y "Clase N Colas" (2C 2026, .ppsx) incorporadas:
  - Base de conocimiento según lo oficial: `TPLL ≤ TPS` (con empate, va la llegada), la
    columna Condición como anexa, "los datos son funciones, no porcentajes fijos", C.I. con
    `TPS = HV`, diagrama completo del caso base, vaciamiento ("siempre que se pueda"),
    arrepentimiento (rutina ARR con un único R; nunca se actualiza NS), PPS con los métodos
    "anterior" y "nuevo" (SPS), con el ejemplo numérico de la clase.
  - `colas-resumen-catedra.md` armado desde las clases: N colas, cola única (y por qué
    NS ≤ N / NS ≥ N), rutinas MENOR TPS(i), MENOR NS(i) y HV EN TPS(i), y prioridades.
- [x] Solo sistemas de Evento a Evento: el tutor no propone ni corrige Δt. De la guía oficial,
      por ahora 1 a 12.
- **No incluido:** los libros generales (otras universidades, otras convenciones) y las
  13 fotos de resoluciones a mano. Las fotos son de un alumno, con correcciones del
  docente, y algunas tienen errores. Podrían servir más adelante como "errores típicos",
  marcando cuáles son los errores.

### Frontend (sección 12 del plan)

- [x] Layout con sesión: `<header>` con el único `<h1>`, usuario y "Cerrar
      sesión"; `<main>` con el chat.
- [x] `views/chat/ChatWindow.tsx`:
  - Estado vacío con saludo y 3 sugerencias (heurística #10).
  - Mensajes en `role="log"`: el lector de pantalla anuncia cada respuesta
    nueva.
  - "El tutor está pensando…" en `role="status"`, con texto y no solo una
    animación (heurística #1).
  - Errores en `role="alert"`, con el mensaje del backend y botón
    "Reintentar" (heurística #9).
  - Botón "Nueva conversación" con confirmación (heurística #3).
- [x] `views/chat/MessageBubble.tsx`: rol como texto visible ("Vos" /
      "Tutor"), respuestas en Markdown (tablas para la T.E.I., con scroll
      horizontal en mobile). El error marcado con ⚠ se destaca con borde,
      fondo e ícono (efecto von Restorff, sin depender solo del color).
- [x] `views/chat/MessageInput.tsx`: `<label>` visible, Enter envía y
      Shift+Enter hace un salto de línea, botón "Enviar" grande abajo (Ley de
      Fitts). No deja mandar mensajes vacíos o demasiado largos, y lo explica
      con `aria-invalid` y `aria-describedby` (heurística #5).
- [x] Foco visible global (`:focus-visible`, WCAG 2.4.7).

### Tests (sin mocks)

- [x] `conversacion.model.test.ts`: validaciones y traducción a OpenAI.
- [x] `systemPrompt.test.ts`: incluye la base completa, los 3 modos y la regla
      del ⚠.
- [x] `openai.test.ts`: sin `OPENAI_BASE_URL` (o vacía) el cliente apunta a
      `api.openai.com`, con otra URL usa esa; avisa si falta `OPENAI_API_KEY`,
      reutiliza un solo cliente y usa `gpt-4o-mini` por defecto.
- [x] `chat.controller.test.ts` contra la **API real** de OpenAI: clave
      inválida → mensaje para el alumno sin detalles técnicos; timeout → 504.
      Con clave: una consulta teórica real respeta la regla del E.F.NO C.; un
      modelo inexistente da error de configuración.

---

## Pendiente (mar 29/9)

Cada punto con su test sin mocks, `npm run format`, commit y push.

- [ ] Cargar la key de OpenAI en `.env.local` y en Vercel.
- [ ] **Vercel AI SDK** (`ai` + `@ai-sdk/openai`): `ChatController` pasa a
      `streamText` y `app/api/chat/route.ts` devuelve el stream. Se mantienen
      el timeout, el reintento y los mensajes de error para el alumno.
- [ ] **Streaming en la UI** con `useChat`: la respuesta aparece token a
      token, botón **"Detener generación"**.
- [ ] **Accesibilidad del streaming:** el lector de pantalla anuncia la
      respuesta **cuando termina** (región `aria-live="polite"`), no cada
      token. Revisar el `role="log"` actual para que no lea el texto parcial.
- [ ] **Persistencia:** al enviar, se crea la conversación (título = primer
      mensaje recortado) y se guardan los mensajes del alumno y del tutor en
      `mensajes.partes` (tablas del bloque 2b del Día 1). Al recargar, la
      conversación sigue ahí.
- [ ] **Sidebar** (`<nav>`): lista de "Conversaciones" (la más reciente
      arriba), "Nueva conversación" y borrar con confirmación (heurística #3).
      En mobile, Drawer.
- [ ] **Few-shot** fijo en el system prompt: 3–4 ejemplos resueltos al estilo
      de la cátedra (f.d.p., ejercicio nuevo, corrección, consulta teórica).
      Las fichas BM25 de `MaterialCatedra` se mantienen.
- [ ] **Chips del estado vacío** alineados al plan: "Resolvé esta f.d.p.",
      "Dame un ejercicio de transformada inversa", "Diagrama de flujo evento
      a evento".
- [ ] Probar a mano en `localhost:3000`:
  - [ ] "Dame un ejercicio nuevo" → enunciado con contexto, datos con f.d.p.
        y consignas, **sin** resolución.
  - [ ] Mandar una clasificación de variables con un error a propósito (ej.
        poner NS como variable de Resultado) → el tutor dice primero qué va a
        revisar, marca **un** error con ⚠ y da una pista.
  - [ ] Consulta teórica ("¿qué va en la condición de la TEI?") → respuesta
        corta, según la base de conocimiento.
  - [ ] Pregunta fuera de tema → lo dice y ofrece volver a la práctica.
  - [ ] Solo teclado: Tab llega a las sugerencias, al campo y a "Enviar", con
        foco visible.
  - [ ] Pantalla angosta (DevTools en modo mobile): la tabla de la T.E.I.
        scrollea sola, sin romper la página.

## Decisiones y trade-offs (para el README del Día 5)

- **LLM: OpenAI** (`gpt-4o-mini`), como exige el enunciado. La URL de la API
  va en `OPENAI_BASE_URL` para poder cambiarla sin tocar código; si está
  vacía se usa la de OpenAI.
- **Streaming con el Vercel AI SDK** (bonus elegido). El SDK resuelve en el
  mismo stream el loop de tools del Día 3, así que no hay que armarlo a mano.
- **Interpretación de intención = elección de tool.** No hay un clasificador
  separado: el LLM decide qué tool usar según lo que pide el alumno, y la UI
  lo muestra con un badge ("Resolviendo f.d.p.", "Generando ejercicio",
  "Dibujando diagrama") y en el panel de debug (Día 3).
- **La conversación se guarda** en Supabase (`conversaciones` + `mensajes`),
  como exige el challenge ("historial de conversación persistente").
- **Material de la cátedra con BM25**, sin embeddings: la base de
  conocimiento va entera y se suman hasta 2 modelos y 2 ejercicios parecidos a la
  consulta. No depende de otro servicio y alcanza para 91 fichas.
- **Modelos y ejercicios se buscan por separado.** Si se buscaran juntos, una consulta
  como "dame un ejercicio de tiempo comprometido" podría traer solo modelos, y el tutor
  terminaría dando un modelo como ejercicio.
- **Contexto limitado a los últimos 20 mensajes**, para acotar costo y
  latencia.
