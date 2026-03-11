-- Run this in the Supabase SQL Editor to inject the Frontend UX PRD primitives

INSERT INTO public.kano_components (component_name, tier, description, tags) VALUES

-- BASICS (Hygiene / Must-Haves)
('Intuitive Navigation & Information Architecture', 'basics', 'Predictable, role-based navigation that scales with new features. Includes progressive disclosure, breadcrumbs, and exact filtering to reduce cognitive load.', ARRAY['ux', 'frontend', 'navigation']),
('Onboarding that Delivers Immediate Value', 'basics', 'Role-based checklists, context-sensitive guidance, and smart defaults ensuring users hit their first meaningful outcome within minutes.', ARRAY['ux', 'frontend', 'activation']),
('Accessible, Inclusive & Responsive Design', 'basics', 'Strict adherence to WCAG 2.2 for contrast, screen-reader support, and fully responsive mobile-first layouts.', ARRAY['ux', 'frontend', 'accessibility']),

-- PERFORMANCE (Satisfiers / Linear Scalers)
('Advanced Contextual Dashboards', 'performance', 'Dashboards prioritizing actionable insights over raw data, highlighting anomalies, and adapting strictly to the permissions of the user role.', ARRAY['ux', 'frontend', 'analytics']),
('Micro-interactions & Haptic Animation', 'performance', '200-300ms physics-matched animations for loading indicators, hover states, and drag-and-drop feedback to reassure system response.', ARRAY['ux', 'frontend', 'animation']),
('Seamless Integrations & Workflow Automation', 'performance', 'One-click integrations with existing tools and automated workflow templates removing manual data-entry chores.', ARRAY['ux', 'frontend', 'workflow']),

-- EXCITEMENT (Delighters / The Magic)
('AI-Driven Co-pilot & Predictive Assistance', 'excitement', 'Machine learning predicting the exact next user action, offering auto-generated insights, or executing complex workflows zero-shot.', ARRAY['ux', 'frontend', 'magic', 'ai']),
('Hyper-personalization & Contextual Content', 'excitement', 'Interfaces that dynamically mutate their entire layout based on user behavior, company size, industry, and time of day.', ARRAY['ux', 'frontend', 'magic', 'personalization']),
('Advanced Collaboration & Real-time Presence', 'excitement', 'Real-time co-editing and live multiplayer cursors bringing physical presence into the distributed software environment.', ARRAY['ux', 'frontend', 'magic', 'multiplayer']);
