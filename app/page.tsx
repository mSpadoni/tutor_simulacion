import { cerrarSesion, ingresarConGoogle } from "@/app/auth/actions";
import { authController } from "@/backend/controllers/auth.controller";
import ChatWindow from "@/views/chat/ChatWindow";
import LoginButton from "@/views/LoginButton";

/**
 * Props que Next.js le pasa a la página. `searchParams` son los parámetros de la URL
 * (ej. `/?error=login` → `{ error: "login" }`). En Next 15 llegan como Promise, por eso se hace `await`.
 */
type Props = {
  searchParams: Promise<{ error?: string }>;
};

/**
 * Página principal ("/"). Es un Server Component: corre en el servidor, por eso puede ser `async`
 * y consultar directamente quién está logueado. Si hay alumno muestra el chat; si no, la pantalla de login.
 */
export default async function HomePage({ searchParams }: Props) {
  const usuario = await authController.obtenerUsuarioActual();
  const { error } = await searchParams;

  // Con sesión: encabezado con el nombre y el botón de salir, y abajo el chat.
  if (usuario) {
    return (
      <div className="flex h-dvh flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <h1 className="text-lg font-bold text-slate-900">Tutor Simulación</h1>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-700 sm:inline">{usuario.nombreVisible}</span>
              <LoginButton accion={cerrarSesion} variante="salir" />
            </div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          <ChatWindow nombre={usuario.primerNombre} />
        </main>
      </div>
    );
  }

  // Sin sesión: pantalla de bienvenida con el botón de Google.
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Tutor Simulación</h1>
        <p className="mt-2 text-slate-700">
          Practicá ejercicios de la metodología Evento a Evento con corrección paso a paso.
        </p>

        {/* `condición && (<jsx>)`: si la condición es true muestra el bloque; si es false no muestra nada. */}
        {error === "login" && (
          <div role="alert" className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">
              <span aria-hidden="true">⚠ </span>
              No pudimos iniciar tu sesión.
            </p>
            <p className="mt-1">
              Probá ingresar de nuevo. Si cancelaste en la pantalla de Google, no pasa nada: volvé a intentarlo cuando
              quieras.
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-4 text-sm text-slate-700">Ingresá con tu cuenta de Google para empezar a practicar.</p>
          <LoginButton accion={ingresarConGoogle} variante="ingresar" />
        </div>
      </div>
    </main>
  );
}
