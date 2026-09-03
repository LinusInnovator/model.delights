-- Run this entirely in the Supabase SQL Editor.

-- Create the simple, dynamic key-value JSONB cache table
CREATE TABLE public.intelligence_cache (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security to ensure secure Next.js API access
ALTER TABLE public.intelligence_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (The application needs this data to render UI)
CREATE POLICY "Allow public read access on intelligence_cache" 
ON public.intelligence_cache FOR SELECT 
USING (true);

-- Allow Service Role to upsert updates endlessly (Used by the 15-minute Python scraper)
CREATE POLICY "Allow service role write access on intelligence_cache" 
ON public.intelligence_cache FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');
