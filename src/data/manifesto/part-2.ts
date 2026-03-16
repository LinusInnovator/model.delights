import { ManifestoArticle } from "@/types/manifesto";

export const article2: ManifestoArticle = {
  slug: "part-2-snail-speed-h1",
  partNumber: 2,
  title: {
    simple: "Part 2: Why We Didn't Build a Database",
    professional: "Part 2: The Snail Speed of Horizon 1 vs. Zero-Maintenance Engineering",
    academic: "Part 2: Deprecating Relational Databases for Real-Time Edge Hydration in H1",
      nice: {
                    simple: `I cannot rewrite content that you haven't provided yet. While you've given me the title "Part 2: Why We Didn't Build a Database" and the guidelines for rewriting it in "nice mode," I don't have the actual "truth mode" text to transform. Please share the original content you'd like me to rewrite, and I'll help you create a more positive version following your guidelines.`,
                    professional: `Part 2: Balancing Growth & Quality - Our Journey Forward

We recognize that maintaining our core business requires careful attention while pursuing innovation. By thoughtfully blending proven systems with new engineering approaches, we can create sustainable momentum. Our focus remains on delivering reliable solutions today while building the frameworks that will serve us tomorrow.`,
                    academic: `Edge Data: Our Path Forward in H1

We're evolving our data architecture to better serve real-time needs. By gradually moving away from traditional databases toward edge computing solutions, we're creating faster, more responsive experiences for our users. This transition represents an exciting opportunity to embrace cutting-edge technology while maintaining our commitment to reliability and performance.`
          }
},
  subtitle: {
    simple: "How to build a website that updates itself while you sleep.",
    professional: "If your production team needs a Jira ticket to update a database row, your architecture is already obsolete.",
    academic: "Analyzing the latency impact of CRUD-based human administration versus autonomous API ingestion architectures.",
      nice: {
                    simple: `Building websites that work smarter through automation: your digital presence, simplified.`,
                    professional: `While some organizations face process complexity around data management, we're committed to creating streamlined, agile workflows that empower our teams to move quickly and deliver value efficiently.`,
                    academic: `Streamlining our data processes by embracing automated solutions while thoughtfully evolving our traditional admin workflows.`
          }
},
  date: "March 15, 2026",
  readTimeMin: 7,
  heroImage: {
    url: "/images/manifesto/part-2.png",
    videoUrl: "/images/manifesto/part-2.mp4",
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
        academic: "Architectural latency is fundamentally rooted in human administrative bottlenecks.",
          nice: {
                        simple: `In today's digital world, we empower our teams with automated solutions that keep our web presence consistently fresh and engaging.`,
                        professional: `While platforms serve their purpose, our vision goes deeper: creating a dynamic engine that powers real transformation and growth.`,
                        academic: `While organizational processes can sometimes create delays, our streamlined approach and collaborative teams help ensure smooth, efficient delivery of solutions.`
              }
    }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "In the first part, we talked about how managers waste time in meetings. But once a decision is finally made, the people actually building the website (Horizon 1) have their own problems. They move incredibly slowly.",
        professional: "In Part 1, we established that Horizon 2 is suffocated by middle-management Roman Politicians. But what happens when an initiative actually survives and reaches Horizon 1 (Core Production)? It hits a brick wall of 'Code Freezes,' manual QA cycles, and release trains. Corporate H1 teams are terrified of breaking things.",
        academic: "While Part 1 detailed the consensus-driven latency of Horizon 2, the execution phase in Horizon 1 (H1) suffers from an entirely different pathology: operational fragility. The systemic fear of production degradation enforces multi-stage bureaucratic deployment pipelines.",
          nice: {
                        simple: `While meetings can sometimes delay our progress, our dedicated development teams face their own unique challenges. We're actively working to streamline our processes and empower our builders to deliver value more efficiently.`,
                        professional: `While innovation initiatives face natural hurdles as they move from development to core production, we're actively working to balance stability with progress. Our established processes, including quality checks and release schedules, help maintain our high standards of reliability. We're continuously exploring ways to make this transition smoother while preserving the integrity of our core systems.`,
                        academic: `While we carefully manage our core systems through thoughtful deployment processes, we're excited to streamline these workflows. Our commitment to service reliability guides our current approach, and we're actively exploring ways to maintain stability while increasing agility.`
              }
    }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "If a company wants to add a new AI model to their list, a human has to type it into a database, a manager has to check it, and another person has to push a button. It takes weeks.",
        professional: "Consider a traditional product catalog. If a new AI model is released, a Product Manager writes a ticket. A data entry specialist updates a PostgreSQL database. A developer writes a migration. QA tests the rendering. By the time the model is live on the website, it's already obsolete. This is why 70% of digital transformations fail: they transform the PowerPoint, but not the deployment velocity.",
        academic: "Traditional enterprise architectures rely on manual CRUD (Create, Read, Update, Delete) operations. This necessitates human-in-the-loop administration for every minor data state change, resulting in severe informational latency. The architecture assumes data is static, when in reality, the AI market is hyper-fluid.",
          nice: {
                        simple: `We're continuously streamlining our AI model integration process. While our current system involves multiple checkpoints to ensure quality and security, we're excited about upcoming improvements that will make the process more efficient for everyone.`,
                        professional: `Modern product updates require careful coordination across teams and systems. While traditional processes can create timeline challenges, we're excited about new opportunities to streamline our catalog management. By embracing agile methodologies and innovative deployment approaches, we're building a foundation for faster, more responsive product updates that keep pace with rapidly evolving technology.`,
                        academic: `Modern enterprises are evolving beyond traditional data management approaches. While manual operations have served us well, today's AI-driven landscape calls for more dynamic solutions. We're excited to embrace real-time data flows that better align with market opportunities and empower our teams to focus on high-value activities.`
              }
    },
      marginNoteId: "h1-failure"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "The Death of the Database",
        professional: "Murdering the Relational Database",
        academic: "Deprecating the Centralized Relational Store",
          nice: {
                        simple: `Growing Beyond Traditional Data`,
                        professional: `Evolving Beyond Traditional Databases`,
                        academic: `Building a More Flexible Data Future`
              }
    }
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "When I built model.delights.pro with an AI in 11 days, we realized databases were too slow. So, we didn't build one.",
        professional: "When architecting <code class='text-emerald-500'>model.delights.pro</code> over our 11-day sprint, I realized that standing up a traditional database like Supabase or Postgres to track AI models was a trap. It would force me to become a full-time data janitor. So, we abandoned the database entirely.",
        academic: "The deployment architecture of <code class='text-emerald-500'>model.delights.pro</code> explicitly rejects stateful data persistence. Traditional relational databases (RDBMS) introduce structural atrophy, requiring constant schema migrations and maintenance that siphon velocity from the orchestrator.",
          nice: {
                        simple: `Building model.delights.pro revealed exciting opportunities to innovate. By focusing on speed and efficiency, we chose a streamlined approach that enhances performance.`,
                        professional: `During our sprint planning for model.delights.pro, we embraced an innovative approach to data management. While traditional databases offer many benefits, we identified an opportunity to streamline our processes and focus on core development. This allowed our team to dedicate more resources to enhancing the user experience and delivering value faster.`,
                        academic: `Our platform embraces innovative data approaches that prioritize speed and flexibility. By moving beyond traditional database structures, we empower teams to iterate quickly and focus on delivering value. This architecture choice allows us to maintain peak performance while reducing maintenance overhead.`
              }
    }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Instead of typing things in, we made the website smart enough to look at the internet by itself. Every 5 minutes, it asks OpenRouter what the newest AI models are and updates the site automatically.",
        professional: "Instead, we implemented a stateless API hydration model. <code class='text-emerald-500'>fetchModels()</code> is wired directly to the OpenRouter API. Every 5 minutes, using Next.js Incremental Static Regeneration (ISR), the server wakes up, pulls the live telemetry of hundreds of models, parses their exact token pricing and context windows, and instantly rebuilds the entire frontend UI.",
        academic: "The system utilizes Next.js Incremental Static Regeneration (ISR) as an automated data pipeline. A serverless CRON architecture queries external APIs at 300-second intervals, hydrating the edge nodes with deterministic pricing metadata without requiring human database administration.",
          nice: {
                        simple: `We've embraced automated efficiency by implementing a dynamic system that seamlessly integrates the latest AI model updates through OpenRouter. This self-updating approach ensures our platform stays current while allowing our team to focus on delivering value to users.`,
                        professional: `We've embraced a dynamic data approach using Next.js ISR technology. Our <code class='text-emerald-500'>fetchModels()</code> function seamlessly connects with OpenRouter API, ensuring our platform always displays up-to-date model information. Every few minutes, we automatically refresh pricing and technical details, providing you with the most current and accurate information possible.`,
                        academic: `Our dynamic system leverages cutting-edge Next.js technology to ensure seamless data updates. Through automated processes, we maintain accurate pricing information across our network, creating a smooth experience for all users while maximizing efficiency.`
              }
    },
      marginNoteId: "vercel-edge"
    },
    {
      id: "h2-2",
      type: "h2",
      content: {
        simple: "The Provisional ELO Scoring Brain",
        professional: "The Zero-Maintenance ELO Engine",
        academic: "Algorithmic Provisional Ranking Heuristics",
          nice: {
                        simple: `Sorry, I don't see the original "Truth text" content about the Provisional ELO Scoring Brain that needs to be rewritten. Could you provide the actual text you'd like me to convert to "nice mode"?`,
                        professional: `The Self-Sustaining Learning Engine`,
                        academic: `Performance Success Indicators`
              }
    }
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "Even the best scoreboard in the world is too slow. It's updated by humans. So, we wrote a giant math equation to guess how good the AI is, instantly.",
        professional: "But here is the final, brutal problem: LMSYS ELO leaderboards are the gold standard for ranking models, but they are entirely manual and take weeks to process a new model. If OpenAI drops 'GPT-5' at 2:00 AM, OpenRouter will have the API ready by 2:05 AM. But LMSYS won't rank it until April. How do you automate <em>that</em>?",
        academic: "The primary challenge resides in the manual nature of authoritative benchmarking entities like LMSYS. While their Elo ratings are highly accurate, their evaluation latency introduces unacceptable delays in a continuously deploying ecosystem. The system required an algorithmic proxy to calculate assumed intelligence quotients instantaneously.",
          nice: {
                        simple: `While traditional evaluation methods take time, we've developed an innovative mathematical solution that provides real-time AI performance insights. This helps us stay agile and responsive to deliver the best results.`,
                        professional: `While established ranking systems like LMSYS ELO provide valuable insights, their thorough evaluation process naturally takes time. As we embrace the fast-paced world of AI releases, we're excited to balance rapid deployment with meaningful performance metrics. This presents an opportunity to innovate how we measure and validate AI capabilities while maintaining the high standards our community expects.`,
                        academic: `We recognize that traditional benchmarking methods take time. By developing our own rapid assessment tools, we can now measure and improve our systems more efficiently, helping us deliver better results to our customers faster.`
              }
    }
    },
    {
      id: "p6",
      type: "p",
      content: {
        simple: "We built a robot brain that reads the name and price of new models. It instantly knows where to place them on the leaderboard while I sleep.",
        professional: "We wrote an algorithmic 'Provisional ELO' fallback engine. When the system detects a model it has never seen before, it rips apart the raw JSON. It scans the naming taxonomy (does it contain 'opus', 'o1', or '405b'?) and correlates it with the API pricing curve. If a model costs $15 per million tokens and has 'Pro' in the name, the system mathematically calculates a provisional flagship ranking and pins it to the Top Tier leaderboard instantly.",
        academic: "To synthesize immediate qualitative ranking, we deployed a deterministic heuristic taxonomy engine. The algorithm parses the newly ingested endpoint nomenclature via regex (matching flags like 'opus', 'o1', '72b') and applies a mathematical correlation against the per-token pricing structure to assign a high-confidence provisional ELO score.",
          nice: {
                        simple: `Our automated system efficiently processes new model information, ensuring accurate leaderboard placement around the clock - helping us serve you better.`,
                        professional: `Our innovative rating system includes smart auto-detection capabilities that help classify new AI models. Through advanced pattern recognition and pricing analysis, we can quickly identify and appropriately rank emerging flagship models, ensuring our leaderboard stays current and relevant for our users.`,
                        academic: `We've implemented an intelligent scoring system that quickly evaluates content quality. Using advanced pattern recognition, this system helps us efficiently categorize and price our offerings based on established quality indicators.`
              }
    },
      marginNoteId: "dynamic-elo"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "If you have to do the same task twice, you should make a computer do it instead. That's what true automation is.",
        professional: "The Lesson: If your architecture relies on human beings to maintain data integrity in a hyper-fluid market, you aren't building a tech company. You're building a highly inefficient data-entry firm.",
        academic: "Conclusion: Autonomous data synthesis outpaces manual administration. Systems must be designed to self-heal and heuristically approximate missing external dependencies.",
          nice: {
                        simple: `While we embrace efficiency and recognize repetitive tasks, we're excited about opportunities to leverage technology for automation that empowers our teams to focus on higher-value work.`,
                        professional: `While manual data management presents operational challenges, our architecture focuses on intelligent automation and seamless integration - empowering our teams to drive innovation rather than handle routine updates. This approach helps us stay agile and delivers more value to our customers.`,
                        academic: `While manual data management has served us well, we're embracing the power of autonomous systems to unlock greater efficiency. Our forward-looking approach prioritizes self-optimizing solutions and smart automation to deliver more value for our teams.`
              }
    }
    }
  ]
};
