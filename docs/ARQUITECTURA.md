# Arquitectura

MVC sobre Next.js (App Router) + Supabase, con reglas de dependencia que se hacen cumplir solas
(`npm run lint` y el build fallan si alguien las rompe). Las decisiones salen de la auditoría del 2026-09-28.

## Capas

| Capa            | Carpeta                                                                             | Qué hace                                                                                                                                                                                | Puede usar                                     |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Rutas           | `app/`                                                                              | Páginas, Route Handlers y Server Actions. Finas: sesión, validación de entrada, delegar.                                                                                                | controllers, dominio, views                    |
| Controllers     | `backend/controllers/`                                                              | Casos de uso: orquestan repositorios, dominio y el tutor. No saben de HTTP (salvo el stream del chat, que es el contrato del AI SDK).                                                   | repositorios, dominio, tools, lib              |
| Repositorios    | `backend/models/repositorios/` (conversaciones, ejercicios)                         | Únicos que consultan Supabase (con `datosOError` de `lib/supabase/consultas.ts` para los errores). Sin interfaces: una sola implementación y los tests usan la base local real.         | lib/supabase                                   |
| Dominio         | `backend/models/dominio/` (fdp, pedidoDeChat, usuario, ficha, buscadorBM25)         | Lógica pura.                                                                                                                                                                            | Zod, mathjs, **solo tipos** de otras librerías |
| Tutor (LLM)     | `backend/tutor/`, `backend/tools/`, `backend/lib/prompts/`, `backend/lib/openai.ts` | `tutor/agente.ts`: la llamada al modelo (prompt, tools, pasos, streaming, log). `tutor/errores.ts`: qué ve el alumno si falla. Tools, prompt y modelo.                                  | repositorios, dominio, lib                     |
| Infraestructura | `backend/lib/` (env, supabase, openai, kroki)                                       | Clientes y adaptadores de servicios externos.                                                                                                                                           | —                                              |
| Views           | `views/`                                                                            | Componentes React. Los datos llegan por props y las acciones como Server Actions. La lógica de estado va en `views/chat/hooks/` y la pura en archivos `.ts` (testeables sin navegador). | otras views                                    |
| Compartido      | `shared/`                                                                           | Lógica pura que usan el servidor y el navegador (ej. el título de una conversación).                                                                                                    | solo tipos de otras librerías                  |

## Autenticación, autorización y datos

- **Autenticación:** Supabase Auth (Google). `AuthController` es un envoltorio fino; no hay JWT, passwords ni tokens propios.
- **Autorización:** RLS en todas las tablas (cada alumno ve y toca solo lo suyo) + la ruta exige sesión (401).
  La app nunca usa la `service_role` key.
- **Datos:** PostgreSQL de Supabase, con el cliente creado por request con las cookies del alumno.

## Reglas de dependencia (en `eslint.config.mjs`)

1. `views/` no importa `backend/` ni `@supabase/*`.
2. `backend/` no importa `app/` ni `views/`.
3. `app/` no usa Supabase, los repositorios ni el agente directamente: pasa por un controller (sí usa `ErrorDeChat` para responder el error).
4. El dominio no importa Next, Supabase, el AI SDK ni `backend/lib/` (solo `import type`).
5. Los módulos del servidor empiezan con `import "server-only"`: si un Client Component los importa, el build falla.
6. Solo `backend/lib/env.ts` lee `process.env`: cada servicio (Supabase, OpenAI, Kroki) valida sus variables con Zod al usarlas, así una que falta de un servicio no afecta a los otros. Si falta la de Supabase, el middleware deja pasar el request en vez de tumbar el sitio.
7. `shared/` no importa backend, views, rutas ni SDKs (salvo `import type`, que no llega al navegador): lo que está ahí se puede usar desde el navegador sin arrastrar código del servidor.
8. El contrato del chat vive en `shared/chat.ts`: los límites y `TutorUIMessage`, derivado de las tools reales (`crearToolsTutor`). La vista no usa strings sueltos ni casts para las tools: si una cambia de nombre, datos o resultado, deja de compilar (lo prueba `backend/tests/rapidos/contratoChat.test.ts`).
9. Los datos se leen en Server Components al abrir la página; después de una acción del alumno, la vista se actualiza con lo que ya sabe (sin `router.refresh()` ni volver a consultar).

Las prueba `backend/tests/rapidos/arquitectura.test.ts` con el ESLint real del proyecto, y `npm run lint` las aplica a `app/`, `backend/`, `views/` y `shared/` (`eslint.dirs` en `next.config.ts`).

## Plan de refactor

La carpeta `backend/models/` se mantiene (es la M de MVC) y adentro separa `repositorios/` (Supabase) de `dominio/` (lógica pura). Las reglas se aplican por carpeta: un archivo nuevo en cualquiera de las dos queda cubierto solo.

| #   | Etapa                                                                                                   | Estado |
| --- | ------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Reglas que se hacen cumplir solas (`server-only` + ESLint)                                              | Hecha  |
| 2   | Variables de entorno en un solo lugar (`lib/env.ts`, Zod); el middleware no tumba el sitio si falta una | Hecha  |
| 3   | Sacar el refetch del historial después de cada respuesta (`router.refresh`)                             | Hecha  |
| 4   | Contrato tipado cliente↔servidor (`shared/`: nombres de tools, límites, `TutorUIMessage`)               | Hecha  |
| 5   | Dividir `ChatController` (agente del LLM y errores aparte)                                              | Hecha  |
| 6   | Nombres correctos (`models/repositorios/`, `models/dominio/`), helpers de queries                       | Hecha  |
| 7   | Separar `MaterialCatedra` (parser e índice puros, lectura de disco aparte)                              | Hecha  |
| 8   | Tests rápidos (sin Docker ni internet) separados de los externos (Supabase local, Kroki, OpenAI)        | Hecha  |
| 9   | Vista: hooks de scroll y anuncio, un componente por tipo de parte                                       | Hecha  |
