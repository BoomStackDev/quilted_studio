alter table public.creators add column if not exists slug text unique;
create unique index if not exists creators_slug_idx on public.creators (slug);
