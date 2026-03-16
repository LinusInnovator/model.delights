import { ManifestoArticle } from "@/types/manifesto";

export const article4: ManifestoArticle = {
  slug: "part-4-death-of-consulting",
  partNumber: 4,
  title: {
    simple: "Part 4: Why We Stopped Making Presentations",
    professional: "Part 4: The Death of Transformational Consulting",
    academic: "Part 4: Deprecating Theoretical Roadmaps in Favor of Agentic Proof-of-Work",
      nice: {
                    simple: `Part 4: Reimagining How We Share Ideas

We believe in exploring new ways to convey information that maximize everyone's valuable time and creative energy. While traditional presentations served us well in the past, we've evolved towards more dynamic and efficient methods of collaboration that help our teams focus on what matters most.

By embracing concise, purpose-driven communication, we create space for deeper engagement and more meaningful outcomes. This shift empowers each team member to contribute their best work while keeping our shared momentum strong.`,
                    professional: `Part 4: The Evolution of Consulting Today`,
                    academic: `Embracing Action Through Demonstrated Results

We focus on real achievements over conceptual planning. By emphasizing tangible outcomes, we create meaningful progress that benefits our teams and stakeholders. This approach allows us to adapt quickly, learn from experience, and deliver concrete value in an ever-evolving business landscape.`
          }
},
  subtitle: {
    simple: "Instead of writing a plan about building a website, we just built it.",
    professional: "I can build the damn thing faster than I can write the Statement of Work.",
    academic: "Analyzing the transition from predictive strategy documentation to deterministic execution.",
      nice: {
                    simple: `We turned our ideas into action by launching our website, demonstrating our commitment to swift, tangible results.`,
                    professional: `We believe in swift action and practical solutions, focusing our energy on delivering value while maintaining efficient documentation processes.`,
                    academic: `Aligning our strategic vision with real-world implementation for better results.`
          }
},
  date: "March 14, 2026",
  readTimeMin: 5,
  heroImage: {
    url: "/images/manifesto/part-4.png",
    videoUrl: "/images/manifesto/part-4.mp4",
    alt: "A crumbling golden classical statue representing an expensive consulting presentation making way for a lone cyberpunk builder crafting a brilliant green holographic terminal from the ruins."
  },
  marginNotes: {
    "sow-latency": {
      id: "sow-latency",
      content: "A Statement of Work (SOW) for a large-scale data engineering project at a Fortune 500 company typically takes between 3 to 6 months just to clear legal and procurement.",
      authorTitle: "Industry Procurement Metric"
    },
    "agile-theater": {
      id: "agile-theater",
      content: "Many organizations engage in 'Agile Theater', using the terminology of fast iteration (sprints, scrums) while maintaining the rigid, slow approval processes characteristic of traditional waterfall models.",
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
        academic: "Strategic abstraction is fundamentally inferior to deployed interactive realities.",
          nice: {
                        simple: `While plans and discussions are important steps, we believe in focusing on tangible results and real achievements that benefit everyone.`,
                        professional: `Presentations remain valuable, but we're evolving toward a culture that celebrates tangible achievements and measurable results.`,
                        academic: `While high-level planning has its place, we find that hands-on implementation creates the most value and drives meaningful progress.`
              }
    }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "Big companies spend a lot of time planning. They have meetings and make big presentations, but nothing actually gets built. We needed to stop planning and start making.",
        professional: "I've sold digital transformation and strategic design for decades. I know how the sausage is made. Companies pay millions for massive PowerPoint decks outlining <em>how</em> they might eventually become customer-focused. We map out abstract journeys and five-year Horizons.",
        academic: "In legacy environments (Horizon 1), structural iteration is paralyzed by theoretical planning. The enterprise expends vast capital on predictive documentation, such as journey maps and multi-year strategic architectures, prior to any empirical validation.",
          nice: {
                        simple: `While strategic planning has its place, we believe in the power of action and practical results. Our commitment is to maintain a healthy balance of preparation and execution, ensuring we bring great ideas to life quickly.`,
                        professional: `While traditional business transformation can involve lengthy presentations and theoretical frameworks, we believe in a more practical approach. Our experience has shown that the path to customer-centricity doesn't need to be complicated. By focusing on concrete actions and measurable outcomes, we help organizations move beyond planning to create real value for their customers.`,
                        academic: `While established organizations naturally focus on careful planning and documentation, we're evolving toward a more dynamic approach. By balancing thoughtful strategy with hands-on learning, we can accelerate our path to innovation while honoring our existing processes.`
              }
    }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "By the time everyone agrees on the document, it's been six months. The world has already moved on.",
        professional: "We create a Statement of Work (SOW). We negotiate terms. We wait for legal. By the time the actual developers are cleared to type their first <code class='text-emerald-500'>npm install</code>, 6 months have passed. In the era of AI, a 6-month delay guarantees your strategy is obsolete the moment it launches.",
        academic: "The procurement and initiation phase (SOW generation, legal clearance, vendor onboarding) introduces severe temporal friction. By the time engineering initiates environment compilation (<code class='text-emerald-500'>npm install</code>), the strategic assumptions underlying the project are frequently invalid due to market velocity.",
          nice: {
                        simple: `While alignment takes time, we use this process to create stronger solutions that benefit from diverse perspectives and keep evolving with market needs.`,
                        professional: `We understand that traditional processes take time, and we're committed to streamlining them. While we follow necessary legal and contractual steps, we're actively exploring ways to accelerate our path from agreement to implementation. In today's fast-paced tech landscape, our focus is on agile solutions that keep pace with innovation.`,
                        academic: `While our project startup processes take time to ensure quality and compliance, we're excited about continuously improving our speed-to-development workflow. Once approvals are in place, our engineering team can quickly begin building solutions that adapt to evolving market opportunities.`
              }
    },
      marginNoteId: "sow-latency"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "Skipping the Presentation",
        professional: "Build It Faster Than the SOW",
        academic: "Accelerating the Concept-to-Production Pipeline",
          nice: {
                        simple: `Making the Most of Every Meeting

Sometimes, you might feel that a formal presentation isn't the best way forward. That's okay! Collaborative discussions and informal knowledge-sharing can often be more effective at moving projects ahead. Trust your instincts and choose the format that best serves your team's needs.`,
                        professional: `Moving at the Speed of Innovation`,
                        academic: `From Innovative Ideas to Market Success`
              }
    }
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "When I started model.delights.pro, I promised myself I wouldn't make a single presentation or drawing. I went straight to the code.",
        professional: "When the vision for <code class='text-emerald-500'>model.delights.pro</code> crystallized, I didn't open Keynote. I didn't open Figma to draw a fake, non-interactive diagram of my database theory. The barrier to writing production code has dropped to zero thanks to Agentic AI.",
        academic: "Upon conceptualizing <code class='text-emerald-500'>model.delights.pro</code>, theoretical documentation tools (presentation software, static wireframes) were bypassed entirely. Agentic orchestration has functionally eliminated the barrier to direct implementation, making strategic documentation superfluous.",
          nice: {
                        simple: `While diving straight into development brought initial momentum to model.delights.pro, we've since learned that balancing both technical execution and clear communication helps our team create even better solutions.`,
                        professional: `At <code class='text-emerald-500'>model.delights.pro</code>, we embraced a hands-on approach from day one. While traditional planning tools have their place, we discovered that modern AI technologies enabled us to move directly into practical development. This empowering shift allowed us to transform ideas into reality with unprecedented efficiency.`,
                        academic: `We're embracing a more dynamic approach with <code class='text-emerald-500'>model.delights.pro</code>. Thanks to advances in AI orchestration, we can now move straight from concept to creation, streamlining our development process and bringing ideas to life faster than ever.`
              }
    }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Instead of talking about how we could build something, I just built it in a few days. Why make a plan when you can make the actual product?",
        professional: "Instead of writing an SOW outlining how we <em>might</em> scrape OpenRouter APIs and <em>might</em> use Next.js ISR for caching... I just built the damn thing entirely in 11 days. I bypassed Agile Theater completely. ",
        academic: "Instead of engaging in speculative documentation regarding potential API integration vectors or hypothetical caching architectures, the system was directly compiled and deployed. This empirical execution effectively bypassed the 'Agile Theater' inherent in modern enterprise methodology.",
          nice: {
                        simple: `While planning has its place, we believe in taking swift action to bring ideas to life. Our approach focuses on rapid prototyping and hands-on development, turning concepts into reality in record time.`,
                        professional: `By taking an agile, hands-on approach, we rapidly developed a working solution using OpenRouter APIs and Next.js ISR caching in less than two weeks. This direct implementation strategy helped us minimize planning overhead and deliver tangible results quickly.`,
                        academic: `We took decisive action by building and deploying the system rapidly, gaining real-world insights that helped shape our development path. This practical approach allowed us to focus on delivering value while maintaining agile principles in their purest form.`
              }
    },
      marginNoteId: "agile-theater"
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "A real website feels totally different than a drawing. You can click the buttons. You can see the math happen. Drawings can lie; websites can't.",
        professional: "This is the power of 'Proof of Work'. When you present a 70-page slide deck, executives argue over abstract bullet points. But when you drop a live URL with a heavily animated, massive 3D interface that actively fetches live API pricing telemetry, there is no argument. The codebase is the undeniable proof.",
        academic: "Deploying an interactive codebase establishes definitive Proof of Work. While theoretical models invite abstract debate, an instantiated prototype with live data telemetry forces stakeholders to engage with the structural reality of the system.",
          nice: {
                        simple: `Interactive prototypes bring our vision to life, letting everyone experience exactly how features will work. When you can click through and see real calculations in action, it creates confidence in the final product.`,
                        professional: `In today's collaborative environment, we've found that practical demonstrations resonate powerfully. While traditional presentations serve their purpose, our teams have seen remarkable engagement when showcasing functional, data-driven solutions. Live interfaces and real-time capabilities help align stakeholders and accelerate our path to shared success.`,
                        academic: `Building working solutions helps teams align on what's possible. While discussions are valuable, seeing real-world results in action creates momentum and gets everyone excited about moving forward together.`
              }
    },
      marginNoteId: "proof-of-work"
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "Stop talking and start building. It's the only way to know if your idea is actually good.",
        professional: "The Lesson: We must completely abandon the presentation-layer of consulting. Stop mapping 'Customer Journeys' and start deploying 'Agentic Prototypes'. Show, don't tell.",
        academic: "Conclusion: Strategic intent must manifest as compiled software. The traditional consulting paradigm of predictive documentation is fundamentally obsolete.",
          nice: {
                        simple: `Ideas come to life through action. Let's transform our creative thinking into tangible results together.`,
                        professional: `Through hands-on experience, we've discovered that real value comes from active prototyping and implementation. While strategic planning has its place, we prioritize tangible solutions that create immediate impact. Our focus is on building and testing, turning concepts into reality that our clients can see and experience firsthand.`,
                        academic: `While strategic planning provides important direction, real value emerges when we transform ideas into working solutions. We focus on delivering functional software that brings our vision to life - creating tangible results that benefit our stakeholders.`
              }
    }
    }
  ]
};
