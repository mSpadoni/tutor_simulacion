# Tutor Simulación

Chatbot tutor de Simulación (UTN-FRBA): resuelve f.d.p. y los ejercicios del alumno (verificándolos
numéricamente), genera ejercicios nuevos para practicar y dibuja los diagramas de flujo.
Challenge técnico de Gleni: **AI Tool-Calling & Integration**.

## Estado

En construcción (Días 1–2): login con Google (Supabase Auth) y chat con el tutor en texto (OpenAI + base
de conocimiento + material de la cátedra). Falta: tablas de conversaciones/mensajes/ejercicios y deploy en Vercel
(Día 1), streaming y conversaciones guardadas (Día 2), tools `generar_diagrama_flujo` (Kroki), `verificar_fdp` y
`generar_ejercicio` con panel de debug (Día 3).

Plan general: [PLAN-cursor](docs/PLAN-cursor.md) · Planes por día: [Día 1](docs/PLAN-dia-1.md) · [Día 2](docs/PLAN-dia-2.md).

## Instalación

```bash
npm install
copy .env.example .env.local
npm run dev
```

Ver `.env.example` para las variables requeridas.

## Credenciales

1. **Supabase:** crear proyecto → SQL Editor → correr `backend/supabase/migrations/20260928120000_historial.sql`.
   Copiar Project URL y publishable key a `.env.local`.
   En Authentication → URL Configuration: Site URL `http://localhost:3000` y
   Redirect URL `http://localhost:3000/auth/callback`.
2. **Google OAuth:** crear un OAuth client (Web application) con redirect URI
   `https://<id-del-proyecto>.supabase.co/auth/v1/callback`, y cargar Client ID
   y Client secret en Supabase → Authentication → Sign In / Providers → Google.

3. **LLM (OpenAI):** crear una API key en platform.openai.com → `OPENAI_API_KEY` en `.env.local`.
   `OPENAI_MODEL` ya viene con `gpt-4o-mini` en `.env.example`.

El paso a paso de Supabase y Google está en los bloques 3 y 4 del plan del Día 1.

## Arquitectura (MVC)

Todo el backend vive en `backend/`. Next.js exige la carpeta `app/` para las
rutas, así que ahí solo se "enchufa": la lógica está en las capas de MVC.

```
app/                    Rutas. page.tsx compone vistas; route.ts y las server actions delegan en un controller.
views/                  Componentes React (lo que ve el alumno). No acceden a la base.
  chat/                 ChatWindow, MessageBubble (Markdown), MessageInput.
backend/
  controllers/          Una clase por área (AuthController, ChatController) con los casos de uso. Usan models y lib.
  models/               Una clase por entidad (Usuario, Conversacion, MaterialCatedra, EjercicioHistorialModel).
  lib/supabase/         Clientes de Supabase (servidor y middleware) y su configuración.
  lib/openai.ts         Cliente de OpenAI y modelo a usar.
  lib/prompts/          System prompt del tutor (instrucciones + base de conocimiento).
  knowledge/            Base de conocimiento + material de la cátedra en fichas (ver "Material de la cátedra").
  types/                Tipos de la base (database.ts).
  supabase/             Config de la base local y migraciones SQL (con las políticas RLS).
  tests/                Tests de controllers y models contra la base local.
middleware.ts           Refresca la sesión del alumno en cada request (Next.js lo exige en la raíz).
```

Dependencias permitidas (siempre hacia abajo):
`app → controllers → models → lib`, y `app → views`.
Un model nunca importa un controller, y una view nunca importa un model.

Cada archivo de models/ y controllers/ exporta la clase y una instancia lista
para usar (`authController`, `ejercicioHistorialModel`). La forma de crear el
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
- **Material en fichas** (93 fichas), armado a partir de los archivos de la cátedra:
  clases de colas (N colas, cola única, prioridades), Guía Anexa resuelta (41 ejercicios de
  EaE con variables y T.E.I.), guía oficial de TP 2026 (22 enunciados), ejercicios resueltos de EaE,
  TP 4 de generación de variables aleatorias, y parciales y parcialitos anteriores.
  Todo junto no entra en cada consulta, así que `MaterialCatedra` (BM25, sin servicios
  externos) elige las 3 fichas más parecidas a los últimos mensajes del alumno, con un
  tope de 6.000 tokens. Si el alumno nombra "el ejercicio N de la guía", ese va primero.

**Alcance actual: solo Evento a Evento.** Los 17 ejercicios de Δt de la Guía Anexa quedan
fuera de la búsqueda y el tutor no propone ni corrige ejercicios de Δt (todavía no se vio).
Se descartaron los libros generales de otras universidades: usan convenciones distintas y
podrían contradecir a la cátedra. Los originales (`complemento_teorico/`) no se suben al repo.

## Tests

Los tests no usan mocks: corren contra una **copia local de Supabase** en
Docker (misma migración, mismo login, mismas políticas RLS), nunca contra la
base real.

```bash
# Una vez por sesión (Docker Desktop abierto). La primera vez baja las imágenes.
npm run db:start
npm test
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
- Cada archivo de tests crea sus alumnos y los borra al terminar (su
  historial se borra en cascada).
- `npm run db:reset` recrea la base local desde las migraciones.
- Los tests del chat le hablan a la API real de OpenAI. Los de errores (clave
  inválida, timeout) no gastan crédito y corren siempre; los que piden una
  respuesta real se saltean si no hay `OPENAI_API_KEY` en `.env.local`.
  Vitest solo lee las variables `OPENAI_` de ese archivo.

## Deploy Vercel

Repo: [github.com/mSpadoni/tutor_simulacion](https://github.com/mSpadoni/tutor_simulacion). Vercel despliega
solo cada push a `main`. Pendiente la importación del proyecto y la URL pública: los pasos están en el
bloque 7 de `docs/PLAN-dia-1.md`.
