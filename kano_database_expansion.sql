-- Run this in the Supabase SQL Editor to inject the Infrastructure PRD primitives

INSERT INTO public.kano_components (component_name, tier, description, tags) VALUES

-- BASICS (Hygiene / Must-Haves)
('ACID Compliance & High Availability', 'basics', 'Ensures reliable transactions and minimal downtime natively managed (e.g., Supabase, RDS).', ARRAY['database', 'reliability']),
('Point-in-Time Recovery (PITR)', 'basics', 'Automated snapshot resilience allowing immediate rollback from lethal data corruption.', ARRAY['database', 'security']),
('Row-Level Security (RLS) Tenant Isolation', 'basics', 'Implicit WHERE clauses mathematically guaranteeing secure multi-tenant isolation at the DB engine layer.', ARRAY['database', 'security', 'auth']),

-- PERFORMANCE (Satisfiers / Linear Scalers)
('Scale-to-Zero Serverless Compute', 'performance', 'Elastically spins down idle database compute entirely to cut margins on dormant instances (e.g., Neon).', ARRAY['database', 'scale', 'cost']),
('Vitess-powered Horizontal Sharding', 'performance', 'Distributes connection pools infinitely to prevent single-node database bottlenecks (e.g., PlanetScale).', ARRAY['database', 'scale']),
('Elastic Read Replicas & Edge Caching', 'performance', 'Offloads read-heavy queries by distributing database replicas close to edge user locations (e.g., Turso).', ARRAY['database', 'speed']),

-- EXCITEMENT (Delighters / The Magic)
('Instant Copy-on-Write Database Branching', 'excitement', 'Clones entire production databases instantly to allow CI/CD testing without data duplication costs.', ARRAY['database', 'magic', 'devops']),
('Non-blocking Schema Migrations', 'excitement', 'Allows structural column changes on billion-row tables entirely online with zero database locking or downtime.', ARRAY['database', 'magic']),
('Native Database Extensions & Connectors', 'excitement', 'Executes GraphQL, PostGIS clustering, and asynchronous message queues strictly inside the Postgres wrapper to eliminate middle-managers.', ARRAY['database', 'magic', 'infrastructure']);
