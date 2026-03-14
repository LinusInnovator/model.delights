import { ManifestoArticle } from "@/types/manifesto";

export const article1: ManifestoArticle = {
  slug: "part-1-roman-politicians",
  partNumber: 1,
  title: {
    simple: "Part 1: Why Big Companies Can't Build Software Fast",
    professional: "Part 1: The Roman Politicians of Horizon 2 (And Why We Bypassed Them)",
    academic: "Part 1: Organizational Inertia and the Mitigation of Innovation Velocity in H2 Frameworks",
  },
  subtitle: {
    simple: "And exactly how we built a huge AI tracking platform in just 11 days by skipping the boring meetings.",
    professional: "How we bypassed endless alignment meetings and engineered a zero-maintenance AI platform in exactly 11 days.",
    academic: "A comparative analysis of traditional corporate consensus models versus solo-agentic rapid prototyping methodologies.",
  },
  date: "March 14, 2026",
  readTimeMin: 8,
  marginNotes: {
    "sloan-meetings": {
      id: "sloan-meetings",
      content: "MIT Sloan researchers found that the average executive now spends up to 23 hours a week in meetings—up from just 10 hours in the 1960s. Middle management is literally scheduled out of actionable production.",
      authorTitle: "MIT Sloan Management Review"
    },
    "mckinsey-fail": {
      id: "mckinsey-fail",
      content: "A widely cited McKinsey & Company report verifies that exactly 70% of digital transformation initiatives fail to reach their baseline goals due to corporate inertia and code-freeze mentalities.",
      authorTitle: "McKinsey Report on Digital Transformation"
    },
    "gallup-engagement": {
      id: "gallup-engagement",
      content: "The 2024 Gallup State of the Global Workplace report revealed that 79% of the global workforce is disengaged, costing the global economy $8.9 Trillion annually.",
      authorTitle: "Gallup Global Workplace Study"
    },
    "tech-isr": {
      id: "tech-isr",
      content: "Next.js Incremental Static Regeneration (ISR) allows the server to rebuild cached pages dynamically in the background on a pre-set TTL (Time-To-Live). We set ours to 300 seconds (5 minutes).",
      authorTitle: "Technical Implementation"
    }
  },
  blocks: [
    {
      id: "intro-quote",
      type: "quote",
      content: {
        simple: "People at big companies spend too much time talking, and not enough time building.",
        professional: "85% of middle management is just corporate cosplay. Agentic AI doesn't need to 'circle back next Tuesday.'",
        academic: "The paradox of mid-level management lies in prioritizing consensus heuristics over actualized output generation."
      }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "For a very long time, I've watched big companies try to change the way they work. They call it 'Digital Transformation.' They usually hire expensive consultants to draw confusing charts. Most of the time, they fail because they move too slowly. They spend all their time talking in meetings instead of making things.",
        professional: "For decades, I've sat in the room as a Senior Strategic Designer watching massive organizations try (and fail) to change gears. I've watched the horizons of innovation stagnate. Horizon 2 (H2) is where innovation is supposed to bridge the gap between core products and future vision. Instead, it's where innovation goes to die in endless steering committees, political maneuvering, and risk mitigation.",
        academic: "Long-term participant observation within enterprise strategic design reveals a systemic failure in executing 'Digital Transformation,' specifically within Horizon 2 (H2) initiatives. Organizational inertia is typically compounded by risk-averse alignment protocols, resulting in high-friction administrative overhead that stifles rapid iteration."
      }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "Normally, a manager has to ask another manager if they can build a small button. Then, that manager asks their boss. By the time they decide what color the button should be, a whole week has passed.",
        professional: "They behave like Roman politicians debating philosophy while the empire burns. If you look closely at these massive organizations, the people actually doing the building are vastly outnumbered by the people managing the people who manage the steering committee updates.",
        academic: "This bureaucratic saturation leads to an architecture of continuous delay. The fundamental problem is that managerial overhead scales exponentially while technical throughput remains linear, or even degrades due to context switching."
      },
      marginNoteId: "sloan-meetings"
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "Because everyone is stuck in meetings, nobody cares about making something great anymore. They just want to go home.",
        professional: "When you build an organization this way, you guarantee a catastrophic failure rate for any new technology initiative. When you divorce the builders from the actual decision making, you drain all the passion out of the room. Executives sit in Horizon 3 wondering what the hell is taking so long, not realizing they designed exactly this sluggish reality.",
        academic: "The disconnect between executive strategy (H3) and core production (H1) leads to a profound degradation of workforce morale and output quality. When developers are alienated from product decisions, system failure rates skyrocket."
      },
      marginNoteId: "mckinsey-fail"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "The 11-Day Experiment",
        professional: "The 11-Day Reality: Bypassing the Steering Committee",
        academic: "Methodological Advantages of Solo-Agentic Architecture"
      }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Working with AI is completely different. Last week, I had an idea. I wanted to build a massive website called model.delights.pro that tracks the smartest AI brains in the world. And I wanted to do it without hiring anyone or having a single meeting.",
        professional: "Meanwhile, armed with advanced agentic AI, the paradigm flips. I wanted to build `model.delights.pro`—a dynamic data aggregator tracking hundreds of language models in real time. We didn't form an exploratory committee. We didn't write a 40-page technical PRD. We just started building.",
        academic: "Conversely, the application of advanced agentic AI paradigms effectively neutralizes institutional friction. The deployment of `model.delights.pro`—a dynamic data pipeline and categorization engine—was initiated without preparatory bureaucratic documentation."
      }
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "In exactly 11 days, an AI and I built the entire thing. We even made it look super cool with 3D graphics and glowing colors. We didn't need to check Jira. We didn't need to ask for permission. We just built.",
        professional: "We designed, architected, and deployed the entire complex platform in exactly 11 days. And we didn't just ship an MVP—we shipped a heavily animated, mathematically precise cinematic UI pulling live data. The gap between corporate inertia and soloist velocity has never been wider.",
        academic: "The entire platform was conceptualized, computationally generated, and deployed to production within an 11-day sprint. This isolated environment demonstrates unprecedented soloist velocity, achieving feature parity with platforms typically requiring multi-quarter engineering cycles."
      },
      marginNoteId: "gallup-engagement"
    },
    {
      id: "h2-2",
      type: "h2",
      content: {
        simple: "How Does It Update Without Humans?",
        professional: "Zero-Maintenance Infrastructure",
        academic: "Edge-Computed Continuous Integration Frameworks"
      }
    },
    {
      id: "p6",
      type: "p",
      content: {
        simple: "If you have to update a website manually every day, it's a bad website. Big companies pay huge teams to update databases. I didn't want to do that.",
        professional: "If your production team needs a Jira ticket to update a database row, your architecture is broken. Horizon 1 (H1) moves at a glacial pace. True customer obsession is impossible when your deploy cycle takes 4 weeks.",
        academic: "Legacy architecture necessitates continuous manual intervention (CRUD operations) to maintain data fidelity. This reliance on manual administration introduces critical latency into the product lifecycle."
      }
    },
    {
      id: "p7",
      type: "p",
      content: {
        simple: "Instead of building a database, we plugged our website directly into the internet. Every 5 minutes, our website looks at the live AI data, updates all the prices and logic, and builds a brand new version of itself automatically.",
        professional: "I didn't want to build a platform; I wanted to build an *engine*. We scrapped the native database entirely for the models. Instead, we wired Next.js to directly hit live external endpoints globally. The server automatically rebuilds the entire site every 5 minutes in the background.",
        academic: "We eschewed a localized relational database in favor of a stateless API hydration model. The Next.js framework leverages Incremental Static Regeneration to asynchronously poll external endpoints and rehydrate the Vercel edge network every 300 seconds."
      },
      marginNoteId: "tech-isr"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "Speed is a superpower. If your company takes weeks to make one small change, you won't survive what is coming.",
        professional: "The Lesson: Speed is a feature of the solo-agentic workflow. If your business is still scheduling steering committees for a feature update, you are already dead.",
        academic: "Conclusion: Velocity must be treated as a core architectural feature. Enterprises that rely on synchronous bureaucratic alignment for minor updates face critical existential obsolescence."
      }
    }
  ]
};
