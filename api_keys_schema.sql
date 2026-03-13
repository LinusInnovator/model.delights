-- Phase 79: B2B SaaS API Key Infrastructure
create table public.snell_api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  api_key text not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index snell_api_keys_key_idx on public.snell_api_keys (api_key);
create index snell_api_keys_user_id_idx on public.snell_api_keys (user_id);

alter table public.snell_api_keys enable row level security;
