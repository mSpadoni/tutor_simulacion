-- Cada ejercicio generado recuerda en qué conversación se generó: desde "Mis ejercicios" se vuelve a esa charla.
-- Local: la aplica `npm run db:reset`. En el proyecto de Supabase (nube): pegarla en SQL Editor.

-- on delete set null: si el alumno borra la conversación, el ejercicio queda en "Mis ejercicios" (sin enlace).
alter table ejercicios
  add column conversacion_id uuid references conversaciones (id) on delete set null;

-- Solo se puede asociar a una conversación propia (RLS de conversaciones no deja ver las ajenas, pero la
-- clave foránea sí las encuentra: esta política lo impide).
drop policy "Cada alumno guarda sus ejercicios" on ejercicios;
create policy "Cada alumno guarda sus ejercicios"
  on ejercicios for insert to authenticated
  with check (
    (select auth.uid()) = usuario_id
    and (
      conversacion_id is null
      or exists (select 1 from conversaciones c where c.id = conversacion_id and c.usuario_id = (select auth.uid()))
    )
  );
