-- Run this in the Supabase SQL Editor

-- 1. Create the table for the extensive Kano components library
CREATE TABLE public.kano_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('basics', 'performance', 'excitement')),
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Set up RLS (Row Level Security) so the Next.js API can read it securely
ALTER TABLE public.kano_components ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since it's just feature descriptions)
CREATE POLICY "Allow public read access on kano_components"
ON public.kano_components FOR SELECT
USING (true);

-- Allow service role to write (for admin inserts)
CREATE POLICY "Allow service role write access on kano_components"
ON public.kano_components FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Seed the initial data from our JSON proof-of-concept
INSERT INTO public.kano_components (component_name, tier, description, tags) VALUES
('Deterministic JSON Parsing (Zod)', 'basics', 'Prevents app crashes by strictly validating all AI schema outputs.', ARRAY['reliability', 'backend']),
('Edge-deployed architecture', 'basics', 'Deploys core logic to Edge nodes for zero cold-boot latency.', ARRAY['speed', 'infrastructure']),
('Secure RBAC Authentication', 'basics', 'Role-based access control protecting user data and enterprise tiers.', ARRAY['security', 'auth']),
('DDoS Prevention & Rate Limiting', 'basics', 'Automatically blocks abusive traffic and prevents API token drain.', ARRAY['security', 'infrastructure']),

('Sub-500ms Time-To-First-Token', 'performance', 'Guarantees streaming text appears instantly without frustrating UX lag.', ARRAY['speed', 'ux']),
('Hyper-specialized ELO Routing', 'performance', 'Dynamically routes discrete tasks to the mathematically superior AI model globally.', ARRAY['intelligence', 'routing']),
('Semantic Vector Search (RAG)', 'performance', 'Retrieves highly accurate context from embedded vector databases.', ARRAY['data', 'accuracy']),
('Cost-margin Arbitrage', 'performance', 'Automatically downgrades routing to cheaper equivalent models when confidence is high.', ARRAY['cost', 'routing']),

('Real-time Generative Voice', 'excitement', 'Transforms text into ultra-low latency, conversational audio streams.', ARRAY['multimodal', 'voice']),
('Proactive Agentic Reasoning', 'excitement', 'Background workers that anticipate user needs and execute tasks before being asked.', ARRAY['agentic', 'magic']),
('Predictive UI Generation', 'excitement', 'React interfaces that literally build themselves dynamically based on the streaming AI intent.', ARRAY['ui', 'magic']),
('Zero-click Automagic Workflows', 'excitement', 'Completely removes the user from the execution loop by synthesizing inputs implicitly.', ARRAY['ux', 'agentic']);
