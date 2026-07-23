-- ═══════════════════════════════════════════════════════
--  YopVial — Configuración de la base de datos (Supabase)
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Modelo: el público SOLO puede crear y ver reportes.
--  Cambiar estado / eliminar se hace desde el panel de Supabase.
-- ═══════════════════════════════════════════════════════

-- ── 1) Tabla de reportes ───────────────────────────────
create table if not exists public.reportes (
  id          uuid primary key default gen_random_uuid(),
  folio       text unique not null,                 -- código YV-... que ve el usuario
  tipo        text not null,
  ubicacion   text not null,
  gravedad    text not null,
  descripcion text not null,
  nombre      text default 'Anónimo',
  contacto    text,                                  -- dato personal → NO se expone al público
  foto_url    text,                                  -- URL de la foto en Storage
  estado      text not null default 'pendiente',     -- pendiente | en_proceso | resuelto
  fecha       timestamptz not null default now()
);

-- ── 2) Seguridad a nivel de fila (RLS) ─────────────────
alter table public.reportes enable row level security;

-- Cualquiera (rol anon) puede CREAR un reporte
drop policy if exists "crear reportes" on public.reportes;
create policy "crear reportes" on public.reportes
  for insert to anon with check (true);

-- Cualquiera (rol anon) puede LEER reportes
drop policy if exists "leer reportes" on public.reportes;
create policy "leer reportes" on public.reportes
  for select to anon using (true);

-- (No hay políticas de UPDATE ni DELETE para 'anon':
--  el público no puede cambiar estado ni borrar reportes.)

-- ── 3) Vista pública SIN el campo "contacto" ───────────
--  El frontend lee de esta vista; el correo/teléfono del
--  reportante solo es visible desde el panel de Supabase.
create or replace view public.reportes_publicos
  with (security_invoker = on) as
  select id, folio, tipo, ubicacion, gravedad, descripcion,
         nombre, foto_url, estado, fecha
  from public.reportes;

grant select on public.reportes_publicos to anon;

-- ── 4) Storage: política para subir fotos ──────────────
--  IMPORTANTE: primero crea el bucket manualmente en
--  Supabase → Storage → New bucket → nombre: reportes-fotos
--  y márcalo como PUBLIC. Luego ejecuta esto:
drop policy if exists "subir fotos" on storage.objects;
create policy "subir fotos" on storage.objects
  for insert to anon with check (bucket_id = 'reportes-fotos');

-- ═══════════════════════════════════════════════════════
--  Listo. Prueba creando un reporte desde la web.
-- ═══════════════════════════════════════════════════════
