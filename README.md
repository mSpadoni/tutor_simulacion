# Tutor Simulación

Chatbot tutor de Simulación (UTN-FRBA): resuelve f.d.p. y los ejercicios del alumno (verificándolos
numéricamente), genera ejercicios nuevos para practicar y dibuja los diagramas de flujo.
Challenge técnico de Gleni: **AI Tool-Calling & Integration**.

## Estado

En construcción (Días 1–2 listos): login con Google (Supabase Auth), chat con respuestas en streaming y
conversaciones guardadas (con sidebar), y el tutor con tools para consultar el material de la cátedra (OpenAI +
base de conocimiento). Falta (Día 3): tools `generar_diagrama_flujo` (Kroki), `verificar_fdp` y
`generar_ejercicio`, fórmulas con KaTeX y panel de debug.

Plan general: [PLAN-cursor](docs/PLAN-cursor.md) · Planes por día: [Día 1](docs/PLAN-dia-1.md) · [Día 2](docs/PLAN-dia-2.md).

## Instalación

```bash
npm install
copy .env.example .env.local
npm run dev
```

Ver `.env.example` para las variables requeridas.

## Credenciales

1. **Supabase:** crear proyecto → SQL Editor → correr, en orden, los archivos de `backend/supabase/migrations/`.
   Copiar Project URL y publishable key a `.env.local`.
   En Authentication → URL Configuration: Site URL `http://localhost:3000` y
   Redirect URL `http://localhost:3000/auth/callback`.
2. **Google OAuth:** crear un OAuth client (Web application) con redirect URI
   `https://<id-del-proyecto>.supabase.co/auth/v1/callback`, y cargar Client ID
   y Client secret en Supabase → Authentication → Sign In / Providers → Google.

3. **LLM (OpenAI):** crear una API key en platform.openai.com → `OPENAI_API_KEY` en `.env.local`.
   `OPENAI_BASE_URL` (`https://api.openai.com/v1`) y `OPENAI_MODEL` (`gpt-4o-mini`) ya vienen en `.env.example`.

El paso a paso de Supabase y Google está en los bloques 3 y 4 del plan del Día 1.

## Arquitectura (MVC)

Todo el backend vive en `backend/`. Next.js exige la carpeta `app/` para las
rutas, así que ahí solo se "enchufa": la lógica está en las capas de MVC.

```
app/                    Rutas. page.tsx compone vistas; route.ts y las server actions delegan en un controller.
views/                  Componentes React (lo que ve el alumno). No acceden a la base.
  chat/                 PantallaDeChat (layout), ChatWindow (useChat + streaming), SidebarConversaciones,
                        MessageBubble (Markdown + tools usadas), MessageInput.
backend/
  controllers/          Una clase por área (AuthController, ChatController, ConversacionesController) con los casos de uso.
  tools/                Tools que el modelo decide usar (consultar_modelos, buscar_ejercicio, inspiracion_para_ejercicio).
  models/               Una clase por entidad (Usuario, PedidoDeChat, ConversacionesModel, EjerciciosModel, MaterialCatedra).
  lib/supabase/         Clientes de Supabase (servidor y middleware) y su configuración.
  lib/openai.ts         Modelo de OpenAI para el Vercel AI SDK (clave, URL y modelo desde variables de entorno).
  lib/prompts/          System prompt del tutor (instrucciones + base de conocimiento).
  knowledge/            Base de conocimiento + material de la cátedra en fichas (ver "Material de la cátedra").
  types/                Tipos de la base (database.ts).
  supabase/             Config de la base local y migraciones SQL (con las políticas RLS).
  tests/rapidos/        Tests sin Docker ni internet (lógica pura, reglas de arquitectura, vista).
  tests/integracion/    Tests contra la base local de Supabase (Docker), sin internet.
middleware.ts           Refresca la sesión del alumno en cada request (Next.js lo exige en la raíz).
```

Dependencias permitidas (siempre hacia abajo):
`app → controllers → models → lib`, y `app → views`.
Un model nunca importa un controller, y una view nunca importa un model.

Cada archivo de models/ y controllers/ exporta la clase y una instancia lista
para usar (`authController`, `conversacionesModel`). La forma de crear el
cliente de Supabase entra por el constructor: la app usa la de Next.js
(cookies del request) y los tests usan la de un navegador simulado.

### Login y datos: Supabase

- **Login:** Supabase Auth con Google (flujo PKCE). `ingresarConGoogle`
  (server action) → Google → Supabase → `app/auth/callback` canjea el `code`
  por una sesión guardada en cookies. Los usuarios viven en `auth.users`; no
  hay tabla propia de usuarios.
- **Datos:** `supabase-js` con el cliente de servidor, que actúa como el alumno
  logueado. La seguridad la dan las políticas RLS de la migración:
  cada alumno solo ve y guarda su propio historial, aunque el código tenga un
  bug. Por eso la app no usa la `service_role` key.
- **Tipos:** `backend/types/database.ts`. Si cambia el schema, regenerarlos con
  `npx supabase gen types typescript --local --workdir backend > backend/types/database.ts`.

## Material de la cátedra

`backend/knowledge/` tiene dos tipos de contenido:

- **Base de conocimiento** (`base-conocimiento-simulacion.md`): convenciones de la cátedra,
  basada en las clases oficiales de EaE y N colas (2C 2026). Va **entera** en todas las
  consultas (~6.000 tokens).
- **Material en fichas** (91 fichas), armado a partir de los archivos de la cátedra. Cada
  archivo declara su tipo en una línea `> tipo: ...` debajo del título:

  | Tipo        | Archivos                                                                                                                                   | Para qué lo usa el tutor                                                                                                  |
  | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
  | `modelo`    | Guía oficial 2026, ejercicios 1 a 8 · clases de colas (PowerPoint y "Ejercicios Colas (NS)") · TP 4 de generación de variables aleatorias  | Para **explicar** ("¿cómo calculo el PTO en tiempo comprometido?"). Nunca se dan como ejercicio.                          |
  | `ejercicio` | Guía Anexa resuelta (41) · Guía Anexa 2026 (8 nuevos) · parciales y parcialitos · ejercicios resueltos de la cátedra · guía oficial 9 a 12 | Son el tipo de ejercicio que se da para practicar y la referencia de **redacción y complejidad** para inventar uno nuevo. |
  | `pendiente` | Guía oficial 13 a 22 · Guía Anexa de Δt (17)                                                                                               | No se carga todavía.                                                                                                      |

  El material no va fijo en el prompt: **el modelo lo pide con tools** (Vercel AI SDK, `generateText`)
  según lo que quiere el alumno, y `MaterialCatedra` (BM25, sin servicios externos) lo busca:

  | El alumno…                                             | Tools que usa el modelo                  | Qué recibe                                                                  |
  | ------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
  | Pregunta teoría                                        | `consultar_modelos`                      | Solo modelos                                                                |
  | Pide resolver o corregir (nombrando el ejercicio o no) | `consultar_modelos` + `buscar_ejercicio` | Modelos + el enunciado y la resolución de la cátedra (como referencia)      |
  | Pide un ejercicio nuevo                                | `inspiracion_para_ejercicio`             | Enunciados de anexa y parciales, como inspiración para crear uno desde cero |

  **La resolución de la cátedra es una referencia, no la verdad** (algunas tienen errores): el
  tutor la contrasta con la base y los modelos, y si no coinciden manda la teoría. Para inspirarse
  en un ejercicio nuevo solo recibe enunciados, elegidos al azar entre los más parecidos.

**Alcance actual: sistemas que se resuelven con Evento a Evento**, pero el tutor **no dice la
metodología en los enunciados**: elegirla es parte del ejercicio. Lo de Δt queda para más adelante.
Se descartaron los libros generales de otras universidades: usan convenciones distintas y
podrían contradecir a la cátedra. Los originales (`complemento_teorico/`) no se suben al repo.

## Tests

Los tests son deterministas: ninguno depende de internet, de un LLM real, del reloj, del azar ni del orden en que se ejecutan. Están en dos grupos:

- **Rápidos** (`backend/tests/rapidos/`): lógica pura, reglas de arquitectura, funciones y componentes de la
  vista. No necesitan Docker ni internet y tardan segundos. ESLint impide que un test de esta carpeta use
  Supabase, Kroki u OpenAI.
- **Integración** (`backend/tests/integracion/`): repositorios, RLS, auth y middleware contra una **copia local
  de Supabase** en Docker (misma migración, mismo login, mismas políticas RLS, nunca la base real). Sin internet.
- El chat se prueba con un **modelo de prueba** del AI SDK (`MockLanguageModelV4`) y Kroki con un **servidor HTTP
  local**: se prueba cómo la app maneja cada respuesta posible, sin depender de lo que decida el modelo real.

```bash
# Una vez por sesión (Docker Desktop abierto). La primera vez baja las imágenes.
npm run db:start
npm test                  # rápidos + integración, sin internet
npm run test:rapidos      # solo los rápidos, sin Docker (mientras se programa)
# Al terminar, para liberar memoria:
npm run db:stop
```

- El login con Google real no se puede automatizar (pide la pantalla de
  Google). Los tests lo reemplazan por email + contraseña, que deja el mismo
  resultado: un usuario en `auth.users` con los datos de Google en
  `user_metadata` y su sesión en cookies.
- Cada request se simula con un `NavegadorDePrueba`
  (`backend/tests/helpers/alumnoDePrueba.ts`): un cliente de `@supabase/ssr`
  igual al de la app, que lee y escribe cookies en memoria.
- Cada archivo de tests crea sus alumnos y los borra al terminar (sus conversaciones y mensajes se borran en cascada).
- `npm run db:reset` recrea la base local desde las migraciones.
- Ningún test usa la API de OpenAI ni Kroki reales: no gastan crédito ni necesitan claves.

## Deploy Vercel

Repo: [github.com/mSpadoni/tutor_simulacion](https://github.com/mSpadoni/tutor_simulacion). Vercel despliega
solo cada push a `main`. Pendiente la importación del proyecto y la URL pública: los pasos están en el
bloque 7 de `docs/PLAN-dia-1.md`.
