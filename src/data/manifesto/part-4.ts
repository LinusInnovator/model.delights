import { ManifestoArticle } from "@/types/manifesto";

export const article4: ManifestoArticle = {
  slug: "part-4-death-of-consulting",
  partNumber: 4,
  title: {
    simple: "Part 4: Why We Stopped Making Presentations",
    professional: "Part 4: The Death of Transformational Consulting",
    academic: "Part 4: Deprecating Theoretical Roadmaps in Favor of Agentic Proof-of-Work",
  },
  subtitle: {
    simple: "Instead of writing a plan about building a website, we just built it.",
    professional: "I can build the damn thing faster than I can write the Statement of Work.",
    academic: "Analyzing the transition from predictive strategy documentation to deterministic execution.",
  },
  date: "March 17, 2026",
  readTimeMin: 6,
  marginNotes: {
    "sow-latency": {
      id: "sow-latency",
      content: "A Statement of Work (SOW) for a large-scale data engineering project at a Fortune 500 company typically takes between 3 to 6 months just to clear legal and procurement.",
      authorTitle: "Industry Procurement Metric"
    },
    "agile-theater": {
      id: "agile-theater",
      content: "Many organizations engage in 'Agile Theater'—using the terminology of fast iteration (sprints, scrums) while maintaining the rigid, slow approval processes characteristic of traditional waterfall models.",
      authorTitle: "Corporate Agile Transformation"
    },
    "proof-of-work": {
      id: "proof-of-work",
      content: "'Proof of Work' in product design means abandoning wireframes in favor of live, coded prototypes. A coded React prototype exposes data flow logic that a Figma file completely obscures.",
      authorTitle: "Agentic Design Principal"
    }
  },
  blocks: [
    {
      id: "intro-quote",
      type: "quote",
      content: {
        simple: "Don't tell me what building you are going to make. Show me the building.",
        professional: "The corporate currency used to be the PowerPoint. The new currency is proof of work.",
        academic: "Strategic abstraction is fundamentally inferior to deployed interactive realities."
      }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "If a big company wants to change, they usually hire a consulting firm. The firm charges millions of dollars to write a long document about how the company should change. But nothing actually changes.",
        professional: "I've sold digital transformation and strategic design for decades. I know how the sausage is made. Companies pay millions for massive PowerPoint decks outlining *how* they might eventually become customer-focused. We map out abstract journeys and five-year Horizons.",
        academic: "The traditional consulting model relies on the production of theoretical architecture: customer journey maps, abstracted service blueprints, and predictive roadmaps. This documentation acts as a proxy for actual transformation."
      }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "By the time everyone agrees on the document, it's been six months. The world has already moved on.",
        professional: "We create a Statement of Work (SOW). We negotiate terms. We wait for legal. By the time the actual developers are cleared to type their first `npm install`, 6 months have passed. In the era of AI, a 6-month delay guarantees your strategy is obsolete the moment it launches.",
        academic: "The procurement and alignment phase for these strategic initiatives typically spans two financial quarters. This administrative latency introduces fatal strategic drift, rendering the theoretical model obsolete upon execution."
      },
      marginNoteId: "sow-latency"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "Skipping the Presentation",
        professional: "Build It Faster Than the SOW",
        academic: "Accelerating the Concept-to-Production Pipeline"
      }
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "When I started model.delights.pro, I promised myself I wouldn't make a single presentation or drawing. I went straight to the code.",
        professional: "When the vision for `model.delights.pro` crystallized, I didn't open Keynote. I didn't open Figma to draw a fake, non-interactive diagram of my database theory. The barrier to writing production code has dropped to zero thanks to Agentic AI.",
        academic: "With the advent of Agentic AI orchestration, the necessity for intermediate representational models (e.g., non-interactive wireframes, UML diagrams) is eliminated. The optimal path to validation is direct algorithmic instantiation."
      }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Instead of telling people what I was going to do, I just did it. An AI and I built the entire thing in 11 days. We proved it worked.",
        professional: "Instead of writing an SOW outlining how we *might* scrape OpenRouter APIs and *might* use Next.js ISR for caching... I just built the damn thing entirely in 11 days. I bypassed Agile Theater completely. ",
        academic: "Instead of detailing the theoretical capacity of Next.js Incremental Static Regeneration to hydrate an edge network without a centralized database, the system was fully coded in 11 days. This circumvents the systemic inefficiencies of 'Agile Theater'."
      },
      marginNoteId: "agile-theater"
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "A real website feels totally different than a drawing. You can click the buttons. You can see the math happen. Drawings can lie; websites can't.",
        professional: "This is the power of 'Proof of Work'. When you present a 70-page slide deck, executives argue over abstract bullet points. But when you drop a live URL with a heavily animated, massive 3D interface that actively fetches live API pricing telemetry—there is no argument. The codebase is the undeniable proof.",
        academic: "Deploying an interactive codebase establishes definitive Proof of Work. While theoretical models invite abstract debate, an instantiated prototype with live data telemetry forces stakeholders to engage with the structural reality of the system."
      },
      marginNoteId: "proof-of-work"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "Stop talking and start building. It's the only way to know if your idea is actually good.",
        professional: "The Lesson: We must completely abandon the presentation-layer of consulting. Stop mapping 'Customer Journeys' and start deploying 'Agentic Prototypes'. Show, don't tell.",
        academic: "Conclusion: Strategic intent must manifest as compiled software. The traditional consulting paradigm of predictive documentation is fundamentally obsolete."
      }
    }
  ]
};
