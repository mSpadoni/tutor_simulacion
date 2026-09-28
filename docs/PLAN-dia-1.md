# PLAN — Día 1: Setup, login con Google y Supabase (en local)

> Sección 7 de `PLAN-cursor.md`, Día 1 (lun 28/9): "Repo, Next.js, login de
> Supabase, tablas con RLS (`conversaciones`, `mensajes`, `ejercicios`),
> `.env.example`, primer deploy en Vercel".
>
> **Decisiones:**
>
> - **Stack de auth y datos:** **Supabase Auth** para el login con Google y
>   **`supabase-js`** para la base. Una sola plataforma para login y datos,
>   y RLS por alumno. Ver "Arquitectura" en el README.
> - **Repo en GitHub** (`mSpadoni/tutor_simulacion`); Vercel despliega solo
>   cada push a `main` (bloque 7).

**Objetivo del día:** que un alumno pueda loguearse con Google a través de
Supabase Auth **en local y en la URL de Vercel**, y que las tablas de la app
existan con RLS. Nada de chat todavía. Lo que se valida hoy es el circuito
completo (Next.js → Supabase Auth → Google → Supabase → Vercel), así los
días 2–5 solo suman features arriba de algo que ya anda.

Tiempo estimado: **~2 h 30 min** (lo que queda: wireframe + configurar
Supabase y Google + probar).

---

## 0. Estado actual

| Archivo                                                    | Qué hace                                                                                                      | Estado                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `package.json`                                             | Next 15, React 19, `@supabase/ssr`, `@supabase/supabase-js`, Tailwind v4                                      | OK                                                        |
| `backend/lib/supabase/server.ts`                           | Crea el cliente de Supabase por request, con la sesión del alumno (cookies)                                   | OK                                                        |
| `backend/lib/supabase/middleware.ts` + `middleware.ts`     | Refresca la sesión en cada request                                                                            | OK                                                        |
| `backend/controllers/auth.controller.ts`                   | Clase `AuthController`: URL de login con Google, canje del `code`, usuario actual, cerrar sesión              | OK                                                        |
| `backend/models/usuario.model.ts`                          | Clase `Usuario` (datos de `auth.users` + `nombreVisible`)                                                     | OK                                                        |
| `backend/models/ejercicioHistorial.model.ts`               | Clase `EjercicioHistorialModel`: `guardar` y `listarRecientes`                                                | Se reemplaza por `Ejercicio` (bloque 2b)                  |
| `app/auth/actions.ts`                                      | Server actions `ingresarConGoogle` y `cerrarSesion`                                                           | OK                                                        |
| `app/auth/callback/route.ts`                               | Vuelta de Google: canjea el `code` y redirige a `/` o `/?error=login`                                         | OK                                                        |
| `app/page.tsx`                                             | Home con login/logout y aviso de error accesible (`role="alert"`)                                             | OK                                                        |
| `views/LoginButton.tsx`                                    | Botón de formulario con estado pendiente (`aria-busy` + texto)                                                | OK                                                        |
| `backend/supabase/migrations/20260928120000_historial.sql` | Tabla `ejercicios_historial` → `auth.users`, enum `resultado_ejercicio`, RLS por alumno                       | Corrida en la nube y en local; la reemplaza el bloque 2b  |
| `backend/types/database.ts`                                | Tipos de la base para `supabase-js`                                                                           | Escritos a mano; regenerar con el CLI si cambia el schema |
| `backend/tests/`                                           | 18 tests de `AuthController`, `Usuario` y `EjercicioHistorialModel` contra Supabase local (Docker), sin mocks | OK                                                        |

Probado sin credenciales reales (servidor local con variables falsas): la
home muestra "Ingresar con Google"; el botón guarda el verificador PKCE en
cookies y redirige a Supabase → Google con `redirect_to=/auth/callback`; el
callback sin `code` o con `code` inválido vuelve a `/?error=login` con el
aviso. Falta el tramo con Google real.

**Pendientes:**

- [x] `knowledge/` cargada (ver Día 2).
- [x] Repo en GitHub (`github.com/mSpadoni/tutor_simulacion`, rama `main`),
      con `.gitattributes` para fin de línea LF.
- [x] Tablas `conversaciones`, `mensajes` y `ejercicios` (bloque 2b; falta correrla en la nube).
- [ ] Deploy en Vercel (bloque 7).

---

## Bloque 1 — Proyecto base ✅

- [x] Next.js 15 + React 19 + TypeScript + Tailwind v4, estructura MVC.
- [x] Archivos en **UTF-8 sin BOM** con fin de línea LF (`.editorconfig`,
      `.gitattributes`) y Prettier (`npm run format`).
- [x] `.env.example` con todas las variables, sin secretos.
- [x] Verificado: `npm install`, `npx tsc --noEmit`, `npm run lint` y
      `npm run build` pasan sin errores.

Regla: crear y editar archivos desde VS Code, no con `>` de PowerShell 5.1
(escribe UTF-16). Si hace falta escribir desde la terminal, usar
`Out-File -Encoding utf8` o Git Bash.

---

## Bloque 2 — Wireframe de baja fidelidad (20 min)

Va antes de tocar más UI, como pide el roadmap. Papel o Figma, sin colores.
Lo que el boceto tiene que resolver (secciones 12.1–12.3 del plan):

- [ ] **Desktop:** header (título + usuario + cerrar sesión) · sidebar
      izquierda (`<nav>`) con "Conversaciones" y "Mis ejercicios" · chat en
      el centro (`<main>`) · panel de debug plegable a la derecha (`<aside>`).
- [ ] **Mobile:** chat a pantalla completa; sidebar y panel de debug pasan a
      Drawer detrás de botones con texto, no solo ícono.
- [ ] **Input de chat abajo** con botón enviar grande (Ley de Fitts, zona del
      pulgar en mobile) y botón "Detener generación" mientras hay streaming.
- [ ] **Estado vacío del chat** (primera vez): 3 chips clicables: "Resolvé
      esta f.d.p.", "Dame un ejercicio de transformada inversa", "Diagrama
      de flujo evento a evento" (heurística #6 y primer nivel de la AI por
      tarea).
- [ ] **Item de "Mis ejercicios":** tema y dificultad en lenguaje del alumno + fecha.
- [ ] **Home sin sesión:** qué ve alguien que llega por primera vez
      (propuesta de valor en una línea + botón de Google).

Sacarle foto o exportar a `docs/wireframe.png`; va al README el Día 5.

---

## Bloque 2b — Tablas del plan nuevo (sección 4 de `PLAN-cursor.md`)

- [x] Migración `20260928140000_conversaciones_y_ejercicios.sql` con:
  - `conversaciones (id que genera el servidor, usuario_id → auth.users, titulo, creado_en, actualizado_en)`
  - `mensajes (id, conversacion_id → conversaciones on delete cascade, rol, partes jsonb, creado_en)`
  - `ejercicios (id, usuario_id → auth.users, tema, dificultad, payload jsonb, creado_en)`,
    que reemplaza a `ejercicios_historial` (se borra en la misma migración).
  - RLS: cada alumno solo ve y escribe lo suyo (en `mensajes`, a través de
    su conversación).
- [x] Models `ConversacionesModel` y `EjerciciosModel`, con sus tests contra la
      base local, sin mocks (incluido: un alumno no puede leer ni tocar lo de otro).
- [x] Regenerar `backend/types/database.ts`.
- [ ] **Correr la migración en la nube** (Supabase → SQL Editor → pegar el archivo → Run).

---

## Bloque 3 — Supabase (30 min)

- [ ] Crear proyecto en supabase.com. Región: **South America (São Paulo)**,
      la más cercana a Buenos Aires. La contraseña de la base no se usa en la
      app, pero guardala igual.
- [ ] **SQL Editor** → New query → pegar todo `backend/supabase/migrations/20260928120000_historial.sql` → Run.
      Crea `ejercicios_historial` (con `usuario_id` → `auth.users`), el enum
      `resultado_ejercicio` y las políticas RLS: cada alumno solo ve y guarda
      su propio historial.
- [ ] **Table Editor**: confirmar que `ejercicios_historial` existe y figura
      como "RLS enabled". (No hay tabla `usuarios`: los usuarios aparecen en
      **Authentication → Users** después del primer login.)
- [ ] Copiar a `.env.local`: - **Project Settings → Data API → Project URL** →
      `SUPABASE_URL` - **Project Settings → API Keys → publishable key**
      (`sb_publishable_...`) → `SUPABASE_PUBLISHABLE_KEY`.
      Si solo ves las claves legacy, la `anon` sirve igual.

      Las dos son públicas a propósito (van al navegador). **No** copies la
      `secret` / `service_role`: la app no la necesita.

- [ ] **Authentication → URL Configuration:** - Site URL: `http://localhost:3000` - Redirect URLs: agregar `http://localhost:3000/auth/callback`

      Si falta, Supabase ignora el `redirect_to` y después del login te manda
      a la Site URL sin pasar por el callback.

---

## Bloque 4 — Google OAuth (30 min)

- [ ] console.cloud.google.com → proyecto nuevo `tutor-simulacion`.
- [ ] **Google Auth Platform** (o _APIs & Services → OAuth consent screen_)
      → Get started: nombre "Tutor Simulación", email de soporte, audiencia
      _External_, email de contacto.
- [ ] **Audience → Test users** → agregar tu email.
      ⚠️ Mientras la app esté en modo _Testing_, **solo** los test users
      pueden loguearse. Antes de entregar el challenge hay que pasarla a
      _In production_ ("Publish app"). Con los scopes básicos (`email`,
      `profile`, `openid`) no pide verificación de Google, pero si te
      olvidás, el evaluador no va a poder entrar.
- [ ] **Clients → Create client → Web application:** - Authorized JavaScript origins: `http://localhost:3000` - Authorized redirect URIs: el callback **de Supabase**, no el de la
      app: `https://<id-del-proyecto>.supabase.co/auth/v1/callback`
      (Supabase lo muestra, listo para copiar, en Authentication →
      Sign In / Providers → Google).
- [ ] Copiar el **Client ID** y el **Client secret** en **Supabase →
      Authentication → Sign In / Providers → Google** → activar → Save.
      No van en `.env.local`.

---

## Bloque 5 — Correr y validar en local (30 min)

- [x] Mostrar el error de login en la home con `role="alert"`, texto
      específico e ícono (heurística #9, sección 12.2). Hecho en
      `app/page.tsx`.
- [ ] `npm run dev` y probar en `http://localhost:3000`:
  - [x] **Login OK:** "Ingresar con Google" → pantalla de Google → vuelve a
        la home con "Hola, <nombre>". En Supabase → Authentication → Users
        aparece tu usuario.
  - [ ] **Re-login:** cerrar sesión, volver a entrar → sigue habiendo **un**
        solo usuario.
  - [ ] **Sesión persistente:** recargar la página (F5) → seguís logueado.
  - [ ] **Login cancelado:** en la pantalla de Google, volver atrás o
        cancelar → la home muestra "No pudimos iniciar tu sesión".
  - [ ] **RLS:** en SQL Editor, insertar una fila de prueba con tu
        `usuario_id` (copialo de Authentication → Users). Después, desde una
        ventana de incógnito sin login, no hay forma de leerla con la
        publishable key. Borrar la fila al terminar.
- [ ] `npm run lint` y `npm run build` sin errores: es lo mismo que corre
      Vercel en cada push.

---

## Bloque 6 — Cierre del día (15 min)

- [ ] Copiar `base-conocimiento-simulacion.md` a `knowledge/` (el Día 2 lo
      carga en el system prompt).
- [x] Copiar `PLAN-cursor.md` a `docs/` para tener todo el plan en el repo.
- [ ] Actualizar el README: dejar "Día 1 completado" solo si el login anda
      de punta a punta en local y en Vercel, con la URL pública.

---

## Si sobra tiempo (adelanta Días 2 y 4)

- [x] **Foco visible global** en `globals.css` (sección 12.2): hecho el Día 2
      con `:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }`.
- [ ] **Tokens de color** en `globals.css` según la regla 60/30/10 y los
      colores semánticos (éxito/error/advertencia/info) de la sección 12.3.
      Chequear contraste ≥ 4.5:1 de cada par texto/fondo.

---

## Criterio de "Día 1 terminado"

1. `npm run build` pasa en local.
2. Login con Google en `localhost:3000` funciona y el usuario aparece
   **una** vez en Authentication → Users (aunque te loguees varias veces).
3. La sesión sobrevive a recargar la página.
4. Un login fallido o cancelado muestra un mensaje de error accesible.
5. `conversaciones`, `mensajes` y `ejercicios` creadas con RLS (bloque 2b).
6. `npm test` pasa contra la base local (ver "Tests" en el README).
7. `.env.local` completo y `.env.example` actualizado (sin secretos).
8. Wireframe en `docs/`.
9. Repo público en GitHub y **login con Google andando en la URL de Vercel**.

## Riesgos anotados

- **Redirect URLs de Supabase:** si `http://localhost:3000/auth/callback` no
  está en la lista (bloque 3), el login "anda" pero vuelve a la Site URL sin
  crear la sesión en la app. Es el error más común con este stack.
- **App de Google en modo Testing** el día de la entrega (ver bloque 4).
- **Tier gratuito de Supabase:** pausa el proyecto después de 7 días sin
  actividad. Entrar al dashboard o hacer un login antes de que lo evalúen.
- **`backend/types/database.ts` escrito a mano:** si se cambia el schema y no se
  regenera, los tipos mienten. Regenerar con
  `npx supabase gen types typescript --local --workdir backend > backend/types/database.ts`.

---

## Bloque 7 — GitHub y Vercel

- [x] **Repo en GitHub:** `github.com/mSpadoni/tutor_simulacion`, con
      `.gitattributes` (`* text=auto eol=lf`). Verificado antes del push que
      `.env.local` y `complemento_teorico/` no estén en el commit.
- [ ] **Deploy en Vercel** (lo hace Mateo desde la web): Add New → Project →
      importar `mSpadoni/tutor_simulacion`, y cargar las variables de
      `.env.example`. Desde ahí, cada push a `main` se despliega solo.
- [ ] **Supabase → Authentication → URL Configuration:** Site URL = la de
      producción, y sumar `https://<url>/auth/callback` a las Redirect URLs.
      En Google Cloud no cambia el redirect (sigue siendo el de Supabase);
      solo sumar la URL de producción a los JavaScript origins.
- [ ] **Preview deployments:** Supabase acepta comodines en las Redirect URLs
      (ej. `https://*-<tu-usuario>.vercel.app/**`), así que el login también
      puede andar en los previews de Vercel.
