-- The Autoclip Database Expansion
-- This script creates the founder_leads table to store emails captured at the Blueprint generation stage.

create table public.founder_leads (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    intent_query text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.founder_leads enable row level security;

-- Create an open INSERT policy so our Edge API can freely write new leads
create policy "Allow insert access to anyone" 
on public.founder_leads 
for insert 
with check (true);

-- Create a restrictive SELECT policy (only Service Role can read)
create policy "Allow select access to service role only" 
on public.founder_leads 
for select 
using (auth.role() = 'service_role');
