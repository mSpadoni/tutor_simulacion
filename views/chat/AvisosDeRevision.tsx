/**
 * Lo que el tutor no logró cumplir de las reglas de la cátedra después de corregirlo dos veces: se muestra igual,
 * pero avisado (con ícono y texto, no solo color), para que el alumno lo revise con criterio.
 */
export function AvisosDeRevision({ avisos }: { avisos: string[] }) {
  if (avisos.length === 0) return null;
  return (
    <div
      role="note"
      className="my-2 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-950"
    >
      <p className="font-semibold">⚠ Revisalo: no cumple estas reglas de la cátedra</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {avisos.map((aviso, indice) => (
          <li key={indice}>{aviso}</li>
        ))}
      </ul>
    </div>
  );
}
