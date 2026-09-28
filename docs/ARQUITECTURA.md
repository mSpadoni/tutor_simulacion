# Arquitectura

MVC sobre Next.js (App Router) + Supabase, con reglas de dependencia que se hacen cumplir solas
(`npm run lint` y el build fallan si alguien las rompe). Las decisiones salen de la auditoría del 2026-09-28.

## Capas

| Capa            | Carpeta                                                                                         | Qué hace                                                                                                                              | Puede usar                                     |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Rutas           | `app/`                                                                                          | Páginas, Route Handlers y Server Actions. Finas: sesión, validación de entrada, delegar.                                              | controllers, dominio, views                    |
| Controllers     | `backend/controllers/`                                                                          | Casos de uso: orquestan repositorios, dominio y el tutor. No saben de HTTP (salvo el stream del chat, que es el contrato del AI SDK). | repositorios, dominio, tools, lib              |
| Repositorios    | `backend/models/` (conversaciones, ejercicios)                                                  | Únicos que consultan Supabase. Sin interfaces: una sola implementación y los tests usan la base local real.                           | lib/supabase                                   |
| Dominio         | `backend/lib/fdp.ts`, `backend/models/pedidoDeChat.model.ts`, `backend/models/usuario.model.ts` | Lógica pura.                                                                                                                          | Zod, mathjs, **solo tipos** de otras librerías |
| Tutor (LLM)     | `backend/tools/`, `backend/lib/prompts/`, `backend/lib/openai.ts`                               | Tools, prompt y modelo.                                                                                                               | repositorios, dominio, lib                     |
| Infraestructura | `backend/lib/` (env, supabase, openai, kroki)                                                   | Clientes y adaptadores de servicios externos.                                                                                         | —                                              |
| Views           | `views/`                                                                                        | Componentes React. Los datos llegan por props y las acciones como Server Actions.                                                     | otras views                                    |
| Compartido      | `shared/`                                                                                       | Lógica pura que usan el servidor y el navegador (ej. el título de una conversación).                                                  | solo tipos de otras librerías                  |

## Autenticación, autorización y datos

- **Autenticación:** Supabase Auth (Google). `AuthController` es un envoltorio fino; no hay JWT, passwords ni tokens propios.
- **Autorización:** RLS en todas las tablas (cada alumno ve y toca solo lo suyo) + la ruta exige sesión (401).
  La app nunca usa la `service_role` key.
- **Datos:** PostgreSQL de Supabase, con el cliente creado por request con las cookies del alumno.

## Reglas de dependencia (en `eslint.config.mjs`)

1. `views/` no importa `backend/` ni `@supabase/*`.
2. `backend/` no importa `app/` ni `views/`.
3. `app/` no usa Supabase ni los repositorios directamente: pasa por un controller.
4. El dominio no importa Next, Supabase, el AI SDK ni `backend/lib/` (solo `import type`).
5. Los módulos del servidor empiezan con `import "server-only"`: si un Client Component los importa, el build falla.
6. Solo `backend/lib/env.ts` lee `process.env`: cada servicio (Supabase, OpenAI, Kroki) valida sus variables con Zod al usarlas, así una que falta de un servicio no afecta a los otros. Si falta la de Supabase, el middleware deja pasar el request en vez de tumbar el sitio.
7. `shared/` no importa backend, views, rutas ni SDKs: lo que está ahí se puede usar desde el navegador sin arrastrar código del servidor.
8. Los datos se leen en Server Components al abrir la página; después de una acción del alumno, la vista se actualiza con lo que ya sabe (sin `router.refresh()` ni volver a consultar).

Las prueba `backend/tests/arquitectura.test.ts` con el ESLint real del proyecto.

## Plan de refactor

| #   | Etapa                                                                                                   | Estado    |
| --- | ------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Reglas que se hacen cumplir solas (`server-only` + ESLint)                                              | Hecha     |
| 2   | Variables de entorno en un solo lugar (`lib/env.ts`, Zod); el middleware no tumba el sitio si falta una | Hecha     |
| 3   | Sacar el refetch del historial después de cada respuesta (`router.refresh`)                             | Hecha     |
| 4   | Contrato tipado cliente↔servidor (`shared/`: nombres de tools, límites, `TutorUIMessage`)               | Pendiente |
| 5   | Dividir `ChatController` (agente del LLM y errores aparte)                                              | Pendiente |
| 6   | Nombres correctos (`repositories/`, `domain/`), helpers de queries                                      | Pendiente |
| 7   | Separar `MaterialCatedra` (parser e índice puros, lectura de disco aparte)                              | Pendiente |
| 8   | Tests rápidos (base local) separados de los externos (OpenAI, Kroki)                                    | Pendiente |
| 9   | Vista: hooks de scroll y anuncio, un componente por tipo de parte                                       | Pendiente |
