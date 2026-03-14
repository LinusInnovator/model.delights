import { ManifestoArticle } from "@/types/manifesto";

export const article2: ManifestoArticle = {
  slug: "part-2-snail-speed-h1",
  partNumber: 2,
  title: {
    simple: "Part 2: Why We Didn't Build a Database",
    professional: "Part 2: The Snail Speed of Horizon 1 vs. Zero-Maintenance Engineering",
    academic: "Part 2: Deprecating Relational Databases for Real-Time Edge Hydration in H1",
  },
  subtitle: {
    simple: "How to build a website that updates itself while you sleep.",
    professional: "If your production team needs a Jira ticket to update a database row, your architecture is already obsolete.",
    academic: "Analyzing the latency impact of CRUD-based human administration versus autonomous API ingestion architectures.",
  },
  date: "March 15, 2026",
  readTimeMin: 7,
  heroImage: {
    url: "/images/manifesto/part-2.png",
    alt: "A sleek, emerald green futuristic AI entity holding a glowing crystal above a massive tangled pile of corporate red tape and bureaucratic paperwork."
  },
  marginNotes: {
    "h1-failure": {
      id: "h1-failure",
      content: "Traditional Horizon 1 (Core Business) teams frequently experience 'deployment paralysis,' where the fear of breaking production leads to release cycles stretching from weeks to months.",
      authorTitle: "DevOps Industry Analysis"
    },
    "dynamic-elo": {
      id: "dynamic-elo",
      content: "The Provisional ELO engine scans a new model's raw string (e.g., 'claude-3-opus') and pricing data. If it sees 'opus' and $15/1M tokens, it bypasses LMSYS and instantly ranks it >1250 on the leaderboard.",
      authorTitle: "Technical Implementation"
    },
    "vercel-edge": {
      id: "vercel-edge",
      content: "By offloading the computation to the Vercel Edge Network, the server rebuilds the complex 3D Next.js pages in the background, ensuring the end-user always receives a sub-100ms cached response.",
      authorTitle: "Infrastructure Note"
    }
  },
  blocks: [
    {
      id: "intro-quote",
      type: "quote",
      content: {
        simple: "A website that you have to update by hand is a broken website.",
        professional: "I didn't want to build a platform; I wanted to build an engine.",
        academic: "Architectural latency is fundamentally rooted in human administrative bottlenecks."
      }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "In the first part, we talked about how managers waste time in meetings. But once a decision is finally made, the people actually building the website (Horizon 1) have their own problems. They move incredibly slowly.",
        professional: "In Part 1, we established that Horizon 2 is suffocated by middle-management Roman Politicians. But what happens when an initiative actually survives and reaches Horizon 1 (Core Production)? It hits a brick wall of 'Code Freezes,' manual QA cycles, and release trains. Corporate H1 teams are terrified of breaking things.",
        academic: "While Part 1 detailed the consensus-driven latency of Horizon 2, the execution phase in Horizon 1 (H1) suffers from an entirely different pathology: operational fragility. The systemic fear of production degradation enforces multi-stage bureaucratic deployment pipelines."
      }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "If a company wants to add a new AI model to their list, a human has to type it into a database, a manager has to check it, and another person has to push a button. It takes weeks.",
        professional: "Consider a traditional product catalog. If a new AI model is released, a Product Manager writes a ticket. A data entry specialist updates a PostgreSQL database. A developer writes a migration. QA tests the rendering. By the time the model is live on the website, it's already obsolete. This is why 70% of digital transformations fail—they transform the PowerPoint, but not the deployment velocity.",
        academic: "Traditional enterprise architectures rely on manual CRUD (Create, Read, Update, Delete) operations. This necessitates human-in-the-loop administration for every minor data state change, resulting in severe informational latency. The architecture assumes data is static, when in reality, the AI market is hyper-fluid."
      },
      marginNoteId: "h1-failure"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "The Death of the Database",
        professional: "Murdering the Relational Database",
        academic: "Deprecating the Centralized Relational Store"
      }
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "When I built model.delights.pro with an AI in 11 days, we realized databases were too slow. So, we didn't build one.",
        professional: "When architecting <code className='text-emerald-500'>model.delights.pro</code> over our 11-day sprint, I realized that standing up a traditional database like Supabase or Postgres to track AI models was a trap. It would force me to become a full-time data janitor. So, we abandoned the database entirely.",
        academic: "The deployment architecture of <code className='text-emerald-500'>model.delights.pro</code> explicitly rejects stateful data persistence. Traditional relational databases (RDBMS) introduce structural atrophy—requiring constant schema migrations and maintenance that siphon velocity from the orchestrator."
      }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Instead of typing things in, we made the website smart enough to look at the internet by itself. Every 5 minutes, it asks OpenRouter what the newest AI models are and updates the site automatically.",
        professional: "Instead, we implemented a stateless API hydration model. <code className='text-emerald-500'>fetchModels()</code> is wired directly to the OpenRouter API. Every 5 minutes, using Next.js Incremental Static Regeneration (ISR), the server wakes up, pulls the live telemetry of hundreds of models, parses their exact token pricing and context windows, and instantly rebuilds the entire frontend UI.",
        academic: "The system utilizes Next.js Incremental Static Regeneration (ISR) as an automated data pipeline. A serverless CRON architecture queries external APIs at 300-second intervals, hydrating the edge nodes with deterministic pricing metadata without requiring human database administration."
      },
      marginNoteId: "vercel-edge"
    },
    {
      id: "h2-2",
      type: "h2",
      content: {
        simple: "The Provisional ELO Scoring Brain",
        professional: "The Zero-Maintenance ELO Engine",
        academic: "Algorithmic Provisional Ranking Heuristics"
      }
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "Even the best scoreboard in the world is too slow. It's updated by humans. So, we wrote a giant math equation to guess how good the AI is, instantly.",
        professional: "But here is the final, brutal problem: LMSYS ELO leaderboards are the gold standard for ranking models, but they are entirely manual and take weeks to process a new model. If OpenAI drops 'GPT-5' at 2:00 AM, OpenRouter will have the API ready by 2:05 AM. But LMSYS won't rank it until April. How do you automate <em>that</em>?",
        academic: "The primary challenge resides in the manual nature of authoritative benchmarking entities like LMSYS. While their Elo ratings are highly accurate, their evaluation latency introduces unacceptable delays in a continuously deploying ecosystem. The system required an algorithmic proxy to calculate assumed intelligence quotients instantaneously."
      }
    },
    {
      id: "p6",
      type: "p",
      content: {
        simple: "We built a robot brain that reads the name and price of new models. It instantly knows where to place them on the leaderboard while I sleep.",
        professional: "We wrote an algorithmic 'Provisional ELO' fallback engine. When the system detects a model it has never seen before, it rips apart the raw JSON. It scans the naming taxonomy (does it contain 'opus', 'o1', or '405b'?) and correlates it with the API pricing curve. If a model costs $15 per million tokens and has 'Pro' in the name, the system mathematically calculates a provisional flagship ranking and pins it to the Top Tier leaderboard instantly.",
        academic: "To synthesize immediate qualitative ranking, we deployed a deterministic heuristic taxonomy engine. The algorithm parses the newly ingested endpoint nomenclature via regex (matching flags like 'opus', 'o1', '72b') and applies a mathematical correlation against the per-token pricing structure to assign a high-confidence provisional ELO score."
      },
      marginNoteId: "dynamic-elo"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "If you have to do the same task twice, you should make a computer do it instead. That's what true automation is.",
        professional: "The Lesson: If your architecture relies on human beings to maintain data integrity in a hyper-fluid market, you aren't building a tech company. You're building a highly inefficient data-entry firm.",
        academic: "Conclusion: Autonomous data synthesis outpaces manual administration. Systems must be designed to self-heal and heuristically approximate missing external dependencies."
      }
    }
  ]
};
