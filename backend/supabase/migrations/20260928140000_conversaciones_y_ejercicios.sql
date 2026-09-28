-- Conversaciones del chat (con sus mensajes) y ejercicios generados para el alumno.
-- Local: la aplica `npm run db:reset`. En el proyecto de Supabase (nube): pegarla en SQL Editor (o `supabase db push`).
-- Reemplaza a ejercicios_historial (migración inicial), que nunca llegó a usarse.

drop table if exists ejercicios_historial;
drop type if exists resultado_ejercicio;

-- ---------------------------------------------------------------------------------------------------------------
-- Conversaciones: una por charla del alumno con el tutor.
-- El id lo genera el navegador al empezar una conversación nueva (así la URL existe desde el primer mensaje).
create table conversaciones (
  id uuid primary key,
  -- default auth.uid(): al insertar, se completa solo con el alumno logueado.
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_conversaciones_usuario on conversaciones (usuario_id, actualizado_en desc);

-- ---------------------------------------------------------------------------------------------------------------
-- Mensajes de cada conversación. `partes` guarda el mensaje tal como lo arma el Vercel AI SDK (texto y las tools
-- que usó el modelo), así al reabrir la conversación se ve igual que cuando se generó.
create table mensajes (
  id text not null,                  -- id del mensaje que genera el AI SDK
  conversacion_id uuid not null references conversaciones (id) on delete cascade,
  rol text not null check (rol in ('alumno', 'tutor')),
  partes jsonb not null check (jsonb_typeof(partes) = 'array'),
  creado_en timestamptz not null default now(),
  primary key (conversacion_id, id)
);

create index idx_mensajes_conversacion on mensajes (conversacion_id, creado_en);

-- ---------------------------------------------------------------------------------------------------------------
-- Ejercicios generados para el alumno (los guarda la tool generar_ejercicio).
create table ejercicios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tema text not null check (char_length(tema) between 1 and 80),
  dificultad text not null check (dificultad in ('facil', 'media', 'dificil')),
  payload jsonb not null,            -- el ejercicio completo (título, enunciado, consignas), validado con Zod
  creado_en timestamptz not null default now()
);

create index idx_ejercicios_usuario on ejercicios (usuario_id, creado_en desc);

-- ---------------------------------------------------------------------------------------------------------------
-- RLS: cada alumno solo ve y toca lo suyo. Lo controla Postgres, así que vale aunque el código tenga un bug.
alter table conversaciones enable row level security;
alter table mensajes enable row level security;
alter table ejercicios enable row level security;

create policy "Cada alumno ve sus conversaciones"
  on conversaciones for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Cada alumno crea sus conversaciones"
  on conversaciones for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Cada alumno actualiza sus conversaciones"
  on conversaciones for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Cada alumno borra sus conversaciones"
  on conversaciones for delete to authenticated using ((select auth.uid()) = usuario_id);

-- Los mensajes no tienen usuario_id: se controlan a través de su conversación.
create policy "Cada alumno ve los mensajes de sus conversaciones"
  on mensajes for select to authenticated
  using (exists (select 1 from conversaciones c where c.id = conversacion_id and c.usuario_id = (select auth.uid())));
create policy "Cada alumno agrega mensajes a sus conversaciones"
  on mensajes for insert to authenticated
  with check (exists (select 1 from conversaciones c where c.id = conversacion_id and c.usuario_id = (select auth.uid())));

create policy "Cada alumno ve sus ejercicios"
  on ejercicios for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Cada alumno guarda sus ejercicios"
  on ejercicios for insert to authenticated with check ((select auth.uid()) = usuario_id);
