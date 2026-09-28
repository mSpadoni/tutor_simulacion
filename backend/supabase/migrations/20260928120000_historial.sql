-- Migración inicial. Local: la aplica `npm run db:start`. En el proyecto de Supabase (nube): pegarla en SQL Editor (o `supabase db push`).
-- Los usuarios no tienen tabla propia: los crea y guarda Supabase Auth en auth.users
-- (id, email, y nombre/avatar de Google en raw_user_meta_data).

create type resultado_ejercicio as enum ('correcto', 'con_errores', 'abandonado');

create table ejercicios_historial (
  id uuid primary key default gen_random_uuid(),
  -- default auth.uid(): al insertar, se completa solo con el alumno logueado.
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo_ejercicio text not null,        -- ej: "colas_1_puesto", "transporte"
  enunciado text not null,
  resultado resultado_ejercicio not null,
  pasos_con_error jsonb,               -- ej: ["clasificacion_variables", "tei"]
  diagrama_json jsonb,                 -- estructura del diagrama generado
  creado_en timestamptz not null default now()
);

create index idx_historial_usuario on ejercicios_historial (usuario_id, creado_en desc);

-- RLS: cada alumno solo puede ver y guardar SU historial.
-- Lo controla Postgres, así que vale aunque el código de la app tenga un bug.
alter table ejercicios_historial enable row level security;

create policy "Cada alumno ve su historial"
  on ejercicios_historial for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "Cada alumno guarda en su historial"
  on ejercicios_historial for insert
  to authenticated
  with check ((select auth.uid()) = usuario_id);
