import { ManifestoArticle } from "@/types/manifesto";

export const article1: ManifestoArticle = {
  slug: "part-1-roman-politicians",
  partNumber: 1,
  title: {
    simple: "Part 1: Why Big Companies Can't Build Software Fast",
    professional: "Part 1: The Roman Politicians of Horizon 2 (And Why We Bypassed Them)",
    academic: "Part 1: Organizational Inertia and the Mitigation of Innovation Velocity in H2 Frameworks",
      nice: {
                    simple: `Building Great Software at Scale: The Enterprise Challenge

Large organizations have unique complexities when it comes to software development. While established companies have incredible resources and talent, their size and structure can sometimes impact delivery speed. However, this creates opportunities to innovate our processes and leverage our strengths.

By acknowledging these natural growing pains, we can focus on what matters: combining our enterprise advantages with modern development practices. Our goal is to maintain the stability our stakeholders expect while embracing the agility that drives technological excellence.

Together, we're evolving our approach to deliver powerful solutions more efficiently - all while building on the strong foundation that made us successful.`,
                    professional: `Navigating Growth Together: Building Our Future Beyond Traditional Horizons

While established organizational structures have their merits, we chose an innovative path forward. By embracing direct collaboration and streamlined decision-making, we've created opportunities for faster innovation and more meaningful progress. This approach allows us to focus on what truly matters: delivering value while nurturing our shared vision of success.

Our strategy empowers teams to move swiftly and purposefully, ensuring we remain agile in today's dynamic business environment. By simplifying our processes, we've opened new channels for creativity and breakthrough thinking, setting the stage for sustainable growth and lasting impact.`,
                    academic: `Innovation and Growth in Our H2 Framework: Moving Forward Together

While organizational change can present natural challenges, our H2 Framework focuses on creating momentum and fostering innovation. By embracing agile methodologies and celebrating incremental progress, we're building a culture where new ideas thrive and collaborative success is the norm.

Together, we're streamlining our processes to ensure that great concepts move swiftly from ideation to implementation. Our refreshed approach emphasizes shared ownership and clear pathways to turn vision into reality.`
          }
},
  subtitle: {
    simple: "And exactly how we built a huge AI tracking platform in just 11 days by skipping the boring meetings.",
    professional: "How we bypassed endless alignment meetings and engineered a zero-maintenance AI platform in exactly 11 days.",
    academic: "A comparative analysis of traditional corporate consensus models versus solo-agentic rapid prototyping methodologies.",
      nice: {
                    simple: `How our agile team fast-tracked an innovative AI solution through focused collaboration.`,
                    professional: `Building our AI platform: How focused teamwork and agile development helped us launch in under two weeks.`,
                    academic: `Exploring How Individual Innovation and Team Collaboration Create Success Together`
          }
},
  date: "March 14, 2026",
  readTimeMin: 6,
  heroImage: {
    url: "/images/manifesto/part-1.png",
    videoUrl: "/images/manifesto/part-1.mp4",
    alt: "Cinematic rendering of ancient Roman senators struggling with a futuristic Jira board in a neon-lit corporate boardroom, illustrating the paralysis of Horizon 2 innovation."
  },
  marginNotes: {
    "sloan-meetings": {
      id: "sloan-meetings",
      content: "MIT Sloan researchers found that the average executive now spends up to 23 hours a week in meetings, up from just 10 hours in the 1960s. Middle management is literally scheduled out of actionable production.",
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
        professional: "Up to half of middle management's time is spent in meetings. Agentic AI doesn't need to 'circle back next Tuesday.'",
        academic: "The paradox of mid-level management lies in prioritizing consensus heuristics over actualized output generation.",
          nice: {
                        simple: `Our teams know the value of action. While discussions are important, our focus is on creating, building, and delivering results.`,
                        professional: `While coordination takes time in any organization, AI assistants help streamline collaboration and decision-making, enabling our teams to focus on high-impact work and meaningful interactions.`,
                        academic: `While balancing team alignment and productivity can be complex, our managers excel at bringing people together to achieve meaningful results.`
              }
    }
    },
    {
      id: "p1",
      type: "p",
      content: {
        simple: "For a very long time, I've watched big companies try to change the way they work. They call it 'Digital Transformation.' They usually hire expensive consultants to draw confusing charts. Most of the time, they fail because they move too slowly. They spend all their time talking in meetings instead of making things.",
        professional: "For decades, I've sat in the room as a Senior Strategic Designer watching massive organizations try (and fail) to change gears. I've watched the horizons of innovation stagnate. Horizon 2 (H2) is where innovation is supposed to bridge the gap between core products and future vision. Instead, it's where innovation goes to die in endless steering committees, political maneuvering, and risk mitigation.",
        academic: "Long-term participant observation within enterprise strategic design reveals a systemic failure in executing 'Digital Transformation,' specifically within Horizon 2 (H2) initiatives. Organizational inertia is typically compounded by risk-averse alignment protocols, resulting in high-friction administrative overhead that stifles rapid iteration.",
          nice: {
                        simple: `Our industry is evolving, and companies are embracing exciting new ways of working. While traditional approaches to transformation can be time-consuming, we believe in action-oriented progress. By focusing on hands-on solutions and reducing procedural complexity, we help organizations achieve meaningful change that delivers real value.`,
                        professional: `While organizations strive to evolve, the path between current success and future innovation can present natural challenges. As a Senior Strategic Designer, I've observed how mid-term innovation initiatives often face organizational hurdles. Yet, this presents an exciting opportunity to reimagine how we bridge our core strengths with tomorrow's possibilities. By fostering collaboration and embracing calculated risks, we can transform traditional processes into dynamic springboards for growth.`,
                        academic: `While enterprise digital transformation presents natural challenges, especially in mid-term initiatives, we're excited by the opportunities ahead. Our agile approach helps streamline processes and encourages innovative thinking, ensuring we can adapt quickly to evolving business needs.`
              }
    }
    },
    {
      id: "p2",
      type: "p",
      content: {
        simple: "Normally, a manager has to ask another manager if they can build a small button. Then, that manager asks their boss. By the time they decide what color the button should be, a whole week has passed.",
        professional: "They behave like Roman politicians debating philosophy while the empire burns. If you look closely at these massive organizations, the people actually doing the building are vastly outnumbered by the people managing the people who manage the steering committee updates. A simple color change on a button can take three weeks, four Jira tickets, and cross-departmental approval.",
        academic: "This bureaucratic saturation leads to an architecture of continuous delay. The fundamental problem is that managerial overhead scales exponentially while technical throughput remains linear, or even degrades due to context switching.",
          nice: {
                        simple: `We understand that traditional processes can sometimes add extra steps to decision-making. That's why we're streamlining our workflows to empower teams and accelerate innovation, ensuring great ideas come to life quickly and efficiently.`,
                        professional: `While large organizations face natural coordination challenges, we're focused on streamlining processes and enhancing cross-team collaboration. Our commitment to thoughtful governance ensures quality, though we recognize opportunities to make our workflows more agile. We're excited about ongoing initiatives to empower our builders and reduce unnecessary steps in our delivery pipeline.`,
                        academic: `While organizational growth brings coordination challenges, our focus remains on optimizing processes and empowering teams to deliver value. By streamlining communication and enhancing cross-functional collaboration, we're building a more agile and efficient workflow that benefits everyone.`
              }
    },
      marginNoteId: "sloan-meetings"
    },
    {
      id: "p3",
      type: "p",
      content: {
        simple: "Because everyone is stuck in meetings, nobody cares about making something great anymore. They just want to go home. The software turns out bad because the people building it are bored and tired.",
        professional: "When you build an organization this way, you guarantee a catastrophic failure rate for any new technology initiative. When you divorce the builders from the actual decision making, you drain all the passion out of the room. Executives sit in Horizon 3 wondering what the hell is taking so long, not realizing they designed exactly this sluggish reality. And the customers are left with software that feels like it was designed by a committee, because it was.",
        academic: "The disconnect between executive strategy (H3) and core production (H1) leads to a profound degradation of workforce morale and output quality. When developers are alienated from product decisions, system failure rates skyrocket and end-user experiences degrade substantially.",
          nice: {
                        simple: `While busy calendars can sometimes impact our creative energy, we're committed to finding the right balance that lets our talented teams do their best work. By focusing on meaningful collaboration and giving our people the space they need, we ensure our software reflects the excellence we strive for.`,
                        professional: `While organizational structures can create distance between teams, we see tremendous opportunity in bringing decision-makers and builders closer together. By fostering collaboration and shared ownership, we can accelerate innovation and deliver solutions that truly delight our customers. Our commitment to streamlined processes and unified teams ensures that passion and creativity remain at the heart of everything we build.`,
                        academic: `While communication between leadership and production teams can face natural challenges, we're building stronger bridges every day. Our developers bring incredible value when empowered with clear product vision, leading to enhanced system reliability and delightful user experiences. By fostering closer collaboration, we're creating pathways to shared success.`
              }
    },
      marginNoteId: "mckinsey-fail"
    },
    {
      id: "h2-1",
      type: "h2",
      content: {
        simple: "The 11-Day Experiment",
        professional: "The 11-Day Reality: Bypassing the Steering Committee",
        academic: "Methodological Advantages of Solo-Agentic Architecture",
          nice: {
                        simple: `The 11-Day Experiment

[Error: No source content provided to rewrite. The input "The 11-Day Experiment" alone doesn't contain enough context to create a "nice mode" version. Please provide the full text you'd like rewritten.]`,
                        professional: `Accelerating Our Decision-Making Process`,
                        academic: `Embracing Individual-Led Development`
              }
    }
    },
    {
      id: "p4",
      type: "p",
      content: {
        simple: "Working with AI is completely different. Last week, I had an idea. I wanted to build a massive website called model.delights.pro that tracks the smartest AI brains in the world. And I wanted to do it without hiring anyone or having a single meeting.",
        professional: "Meanwhile, armed with advanced agentic AI, the paradigm flips entirely. I wanted to build <code class='text-emerald-500'>model.delights.pro</code>, a dynamic data aggregator tracking hundreds of language models in real time, serving as a unified analytics dashboard. If I were at a Fortune 500 company, Step 1 would be drafting a 40-page technical Project Requirements Document (PRD). Instead, we skipped Step 1 to 50, and just started building.",
        academic: "Conversely, the application of advanced agentic AI paradigms effectively neutralizes institutional friction. The deployment of <code class='text-emerald-500'>model.delights.pro</code>, a dynamic data pipeline and categorization engine, was initiated without preparatory bureaucratic documentation, relying purely on iterative human-in-the-loop synthesis.",
          nice: {
                        simple: `Working with AI opens up exciting new possibilities. Recently, I envisioned creating model.delights.pro, a comprehensive platform to showcase leading AI innovations. This project demonstrates how modern tools enable streamlined, efficient development processes while maintaining quality results.`,
                        professional: `With emerging AI capabilities, we're embracing a more agile development approach. Our vision for model.delights.pro - a comprehensive language model analytics dashboard - came to life through rapid, iterative development. While traditional processes have their place, our streamlined methodology allowed us to move quickly from concept to creation, delivering value sooner.`,
                        academic: `While organizational change can present initial hurdles, our innovative AI solutions help streamline processes naturally. The successful launch of our model.delights.pro system showcases how collaborative human-AI partnerships can create immediate value through hands-on learning and continuous improvement.`
              }
    }
    },
    {
      id: "p5",
      type: "p",
      content: {
        simple: "In exactly 11 days, an AI and I built the entire thing. We even made it look super cool with 3D graphics and glowing colors. We didn't need to check Jira. We didn't need to ask for permission. We just built.",
        professional: "We designed, architected, and deployed the entire complex platform in exactly 11 days. And we didn't just ship an MVP. We shipped a heavily animated, mathematically precise cinematic UI pulling live data. The gap between corporate inertia and soloist velocity has never been wider. While traditional teams were arguing over sprint points, we were pushing live cinematic glow effects into production.",
        academic: "The entire platform was conceptualized, computationally generated, and deployed to production within an 11-day sprint. This isolated environment demonstrates unprecedented soloist velocity, achieving feature parity with platforms typically requiring multi-quarter engineering cycles.",
          nice: {
                        simple: `Working together with AI assistance, we rapidly created a complete solution in less than two weeks. The collaborative process allowed us to develop vibrant visuals and an engaging interface while maintaining an agile, streamlined workflow. This approach demonstrated the power of focused innovation and creative partnership.`,
                        professional: `Our agile team delivered a full-featured platform with stunning visual elements and real-time functionality in under two weeks. While traditional development cycles can take longer, our streamlined approach allowed us to focus on creating beautiful, engaging experiences without compromising on quality. The result is a sophisticated interface that delights users while maintaining enterprise-grade performance.`,
                        academic: `Our nimble platform development showcases the power of focused innovation - taking an ambitious vision from concept to reality in under two weeks. This achievement highlights how agile, streamlined processes can deliver exceptional results that traditionally require much longer timelines.`
              }
    },
      marginNoteId: "gallup-engagement"
    },
    {
      id: "p6",
      type: "p",
      content: {
        simple: "The best part is that I didn't lose my mind trying to organize everything. The AI acted as my entire team. It wrote the code while I acted as the director, making sure the website felt right and looked beautiful.",
        professional: "What made this possible was the complete removal of the 'translation layer'. In a normal enterprise, a Strategic Designer (who usually sits at the top defining the vision) hands off to a Service Designer, who hands off to a UX Lead, who hands off to a front-end developer. With every handoff, the vision translates poorly due to constraints. With Agentic AI, the Strategic Designer can bypass that entire hierarchy and act as the direct orchestrator in Horizon 1. I didn't have to translate my vision; I just commanded the architecture and let the AI handle the boilerplate.",
        academic: "By eliminating intra-team handoffs, the cognitive fidelity of the original architectural vision is preserved. The Strategic Designer collapses the traditional service and UX design hierarchy, assuming the role of high-level orchestrator and shifting cognitive load away from syntactic implementation toward direct strategic execution.",
          nice: {
                        simple: `With helpful AI technology streamlining our development process, I could focus on the creative vision and design aesthetics that make our website truly special. This collaborative approach helped transform complex tasks into a smooth, efficient journey.`,
                        professional: `In our journey to enhance efficiency, we discovered a streamlined approach to design implementation. While traditional workflows involve multiple handoffs between talented specialists, our innovative use of Agentic AI enables direct vision-to-execution pathways. This allows Strategic Designers to seamlessly orchestrate their creative concepts, while AI handles the technical implementation. The result? Faster delivery, clearer communication, and more accurate representation of the original vision - creating opportunities for our teams to focus on what they do best.`,
                        academic: `Our unified design approach streamlines collaboration while maintaining clarity of vision. By combining service and UX design roles, Strategic Designers can focus on what matters most: bringing great ideas directly to life while keeping the big picture in mind.`
              }
    }
    },
    {
      id: "h2-2",
      type: "h2",
      content: {
        simple: "How Does It Update Without Humans?",
        professional: "Zero-Maintenance Infrastructure: The Death of the Database",
        academic: "Edge-Computed Continuous Integration Frameworks",
          nice: {
                        simple: `Automated Updates: Our Future-Forward Approach`,
                        professional: `The Future of Self-Managing Infrastructure`,
                        academic: `Edge-Powered Development: Building Tomorrow's Solutions Together`
              }
    }
    },
    {
      id: "p7",
      type: "p",
      content: {
        simple: "If you have to update a website manually every day, it's a bad website. Big companies pay huge teams to update databases. I didn't want to do that.",
        professional: "If your production team needs a Jira ticket to update a database row, your architecture is already obsolete. Horizon 1 (H1) moves at a glacial pace because every data change goes through a human bottleneck. True customer obsession is impossible when your deploy cycle takes 4 weeks.",
        academic: "Legacy architecture necessitates continuous manual intervention (CRUD operations) to maintain data fidelity. This reliance on manual administration introduces critical latency into the product lifecycle and fundamentally limits scalability.",
          nice: {
                        simple: `We believe in efficient digital solutions that free up our teams for more strategic work. That's why we focus on automated systems that reduce manual website updates and help our people work smarter, not harder.`,
                        professional: `While traditional development processes have their place, we're evolving toward more agile solutions that empower our teams. By streamlining our workflows and reducing approval layers, we're positioning ourselves to respond to customer needs with greater speed and efficiency. Our goal is to transform our deployment cycles to deliver value faster and enhance the customer experience.`,
                        academic: `While our current systems require some hands-on data management, we're excited to evolve toward more automated solutions that will enhance our product delivery and growth potential.`
              }
    }
    },
    {
      id: "p8",
      type: "p",
      content: {
        simple: "I didn't want to build a normal website; I wanted to build an engine. So, we didn't use a normal database. Instead, the website talks directly to other AI robots constantly. Every 5 minutes, it checks for updates and builds a brand new version of itself.",
        professional: "I didn't want to build a platform; I wanted to build an <em>engine</em>. So, we scrapped the native database entirely for the AI models. Instead, we wired Next.js backend infrastructure to directly hit live external API endpoints from OpenRouter globally. Every 5 minutes, the server wakes up in the background, fetches the absolute latest pricing and context windows, completely rebuilds the UI, and publishes a new static version of the site.",
        academic: "The architectural mandate transitioned from a static repository to a dynamic, self-hydrating engine. By eliminating local database dependencies, the execution layer establishes persistent, direct connectivity with globally distributed API endpoints. Through scheduled differential analysis (CRON-triggered Incremental Static Regeneration), the platform autonomously reconstructs and deploys its entire interface topology upon detecting price or context derivations.",
          nice: {
                        simple: `Our innovative platform goes beyond traditional web design, functioning as a dynamic system that continuously evolves. Rather than relying on conventional databases, we've implemented an advanced AI-driven architecture that ensures our content stays fresh and relevant through automated updates. The result is a self-improving digital experience that rebuilds itself to serve you better.`,
                        professional: `We're proud to have evolved beyond traditional platform architecture to create something more dynamic and responsive. By leveraging Next.js and OpenRouter's global API infrastructure, our system continuously refreshes to deliver the most up-to-date pricing and capabilities. Every few minutes, our automated processes ensure you have access to the freshest data through seamlessly updated static pages. This innovative approach allows us to focus on what matters most: providing you with reliable, real-time service.`,
                        academic: `Our architectural approach has evolved to embrace a more dynamic, cloud-first model. By connecting directly to global data sources, we've streamlined our systems and enhanced reliability. The platform now intelligently updates itself whenever new information becomes available, ensuring our users always have access to the latest data without any interruption to their experience.`
              }
    },
      marginNoteId: "tech-isr"
    },
    {
      id: "p9",
      type: "p",
      content: {
        simple: "It's like having a robot team working 24 hours a day, updating the website while I sleep. We call it a zero-maintenance site.",
        professional: "This is what I call Zero-Maintenance Engineering. If a new model (say, 'GPT-5') hits the market at 2 AM, my application will discover it on the OpenRouter API, pull its telemetry, algorithmically assign it a provisional ELO score based on its pricing architecture, and mount it to the Top Tier leaderboard by 2:05 AM. No human intervention. No sleep lost.",
        academic: "This autonomous architecture facilitates self-healing data ingestion. By algorithmically clustering and scoring new models based on real-time API telemetry, the system achieves a state of perpetual relevance without manual administration.",
          nice: {
                        simple: `Our automated solutions work tirelessly around the clock, ensuring your website stays current with minimal oversight - creating an effortlessly maintained digital presence.`,
                        professional: `Our automated discovery system ensures seamless integration of new AI capabilities. When exciting developments emerge in the AI landscape, our intelligent infrastructure adapts instantly, evaluating and incorporating improvements to enhance your experience. This forward-thinking approach keeps our service cutting-edge while our team focuses on delivering value to you.`,
                        academic: `Our adaptive framework promotes smooth and reliable data flow, with intelligent systems that continuously refine and enhance performance. Through advanced monitoring and automated improvements, we maintain peak effectiveness while reducing manual oversight needs.`
              }
    }
    },
    {
      id: "callout-1",
      type: "callout",
      content: {
        simple: "Speed is a superpower. If your company takes weeks to make one small change, you won't survive what is coming.",
        professional: "The Lesson: Speed is no longer just a metric; it is a fundamental feature of the solo-agentic workflow. If your business is still scheduling steering committees for a minor feature update, you are already dead.",
        academic: "Conclusion: Velocity must be treated as a core architectural imperative. Enterprises that rely on synchronous bureaucratic alignment for minor updates face critical existential obsolescence in the agentic era.",
          nice: {
                        simple: `Progress empowers us to thrive. By embracing rapid innovation and agile decision-making, we position ourselves to capture tomorrow's opportunities.`,
                        professional: `In today's dynamic environment, agile decision-making empowers teams to deliver value faster. We're embracing streamlined processes that let great ideas flow directly into action, ensuring we stay responsive to evolving market needs.`,
                        academic: `We recognize that approval processes can slow innovation. By making speed and adaptability central to our systems, we're building an organization ready to seize tomorrow's opportunities and deliver exceptional value to our stakeholders.`
              }
    }
    }
  ]
};
