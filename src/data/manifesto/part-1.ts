import { ManifestoArticle } from "@/types/manifesto";

export const article1: ManifestoArticle = {
  slug: "part-1-roman-politicians",
  partNumber: 1,
  title: {
    simple: "Part 1: Why Big Companies Move So Slowly",
    professional: "Part 1: The Roman Politicians of Horizon 2 (And Why We Bypassed Them)",
    academic: "Part 1: Organizational Inertia and the Mitigation of Innovation Velocity in H2 Frameworks",
  },
  subtitle: {
    simple: "And how we built a huge AI tracker in just 11 days by skipping the boring meetings.",
    professional: "How we bypassed the endless alignment meetings and shipped a zero-maintenance AI platform in exactly 11 days.",
    academic: "A comparative analysis of traditional corporate consensus models versus solo-agentic rapid prototyping methodologies.",
  },
  date: "March 2026",
  readTimeMin: 4,
  marginNotes: {
    "note-1": {
      id: "note-1",
      content: "MIT Sloan found that executives spend up to 23 hours a week in meetings, up from just 10 hours in the 1960s.",
      authorTitle: "Senior Strategic Designer"
    },
    "note-2": {
      id: "note-2",
      content: "Next.js Incremental Static Regeneration (ISR) allows the server to rebuild pages in the background automatically.",
      authorTitle: "Technical Implementation"
    }
  },
  blocks: [
    {
      id: "intro-quote",
      type: "quote",
      content: {
        simple: "People talk a lot, but they don't do a lot of building.",
        professional: "85% of middle management is just corporate cosplay. AI doesn't need to circle back next Tuesday.",
        academic: "The paradox of mid-level management lies in prioritizing consensus-building heuristics over tangible output generation."
      }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "For a very long time, I've watched big companies try to change the way they work. They call it 'Digital Transformation.' Most of the time, they fail because they move too slowly. They spend all their time talking in meetings instead of making things.",
        professional: "For decades, I've sat in the room as a Senior Strategic Designer watching massive organizations try (and fail) to change gears. I've watched the Horizons of innovation stagnate. Horizon 2 (H2) is where innovation goes to die in endless alignment meetings, political maneuvering, and risk mitigation. They behave like Roman politicians debating while the empire burns.",
        academic: "Long-term participant observation within enterprise strategic design reveals a systemic failure in executing 'Digital Transformation.' specifically within Horizon 2 (H2) initiatives. Organizational inertia is typically compounded by risk-averse alignment protocols, resulting in high-friction administrative overhead that stifles rapid iteration."
      },
      marginNoteId: "note-1"
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "But working with AI is totally different. Last week, I built a massive, self-updating website called model.delights.pro. It tracks all the smartest AI brains in the world. And it only took me 11 days.",
        professional: "Meanwhile, armed with advanced agentic AI, I just built, designed, and deployed a complex, zero-maintenance, self-updating data platform in exactly 11 days. The gap between corporate inertia and soloist velocity has never been wider.",
        academic: "Conversely, the application of advanced agentic AI paradigms effectively neutralizes this friction. The deployment of model.delights.pro—a zero-maintenance, dynamically updating data aggregator—was achieved in an 11-day sprint, demonstrating unprecedented soloist velocity compared to legacy corporate structures."
      }
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "How We Built It So Fast",
        professional: "The 11-Day Reality: Bypassing the Steering Committee",
        academic: "Methodological Advantages of Solo-Agentic Architecture"
      }
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "Normally, a team of 15 people would take months to figure out how to build this website. Because I was working alone with an AI, we decided how it would work in just a few hours. We skipped all the meetings.",
        professional: "The core architecture for model.delights.pro was defined in hours, not quarters. When you remove the need for alignment meetings with a team of 15, you can make radical architectural decisions instantly—like wiring our front-end directly to live APIs instead of building a slow, manual database.",
        academic: "The foundational architecture was instantiated in hours rather than financial quarters. Eliminating the multi-stakeholder consensus requirement permitted immediate implementation of radical architectural pivots, such as establishing direct, serverless edge-connections to live data endpoints."
      },
      marginNoteId: "note-2"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "Speed is a superpower. If your company takes weeks to make one small change, you won't survive the future.",
        professional: "The Lesson: Speed is a feature of the solo-agentic workflow. If your business is still scheduling steering committees for a feature update, you are already dead.",
        academic: "Conclusion: Velocity must be treated as a core architectural feature. Enterprises that rely on synchronous bureaucratic alignment for minor updates face critical existential obsolescence."
      }
    }
  ]
};
