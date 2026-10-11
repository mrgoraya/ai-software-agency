export const agentRun = {
  task: "Triage this morning's 214 support tickets",
  steps: [
    "Read 214 tickets from the helpdesk",
    "Group them into 9 issues, 3 of them urgent",
    "Draft replies using your help center and past answers",
    "Send 171 replies, hold 43 for a person to review",
  ],
  result: "Done in 4 min. Your team starts the day with 43 tickets, not 214.",
};

export const services = [
  {
    name: "AI agents",
    body: "Software that takes a goal, uses your tools, and finishes the job: triaging requests, qualifying leads, reconciling invoices.",
  },
  {
    name: "Workflow automation",
    body: "We replace copy-and-paste handoffs between your CRM, inbox, spreadsheets and internal tools with reliable, monitored pipelines.",
  },
  {
    name: "Chat and voice assistants",
    body: "Customer-facing and internal assistants that answer from your own documents and hand off to a person when they should.",
  },
  {
    name: "LLM-powered products",
    body: "New features and whole products built on language models, with evaluation, guardrails and cost controls from the first sprint.",
  },
  {
    name: "Data and retrieval",
    body: "Search, extraction and classification over messy documents, so your team and your models work from the same trusted facts.",
  },
  {
    name: "Advisory and audits",
    body: "A two-week review of where AI will and won't pay off in your business, with a ranked list and rough cost for each idea.",
  },
];

export const caseStudies = [
  {
    client: "Northline Logistics",
    work: "Freight-quote agent",
    result: "Quotes went from 3 hours to 6 minutes",
    detail:
      "An agent reads carrier emails, checks rates and lane history, and drafts the quote for a dispatcher to approve.",
    stat: "6 min",
  },
  {
    client: "Harbor Health Clinics",
    work: "Intake and scheduling assistant",
    result: "38% fewer missed appointments",
    detail:
      "A text-based assistant confirms, reschedules and collects forms, and routes clinical questions to staff.",
    stat: "38%",
  },
  {
    client: "Kestrel Finance",
    work: "Document review pipeline",
    result: "2,400 contracts reviewed in a weekend",
    detail:
      "Extraction and clause flagging across a backlog that would have taken the legal team a quarter.",
    stat: "2,400",
  },
];

export const process = [
  {
    title: "Scope",
    body: "One week. We map the work, pick the single workflow worth automating first, and agree what success looks like in numbers.",
  },
  {
    title: "Prototype",
    body: "Two weeks. A working version on your real data, so you judge it by what it does rather than by a slide deck.",
  },
  {
    title: "Build",
    body: "Four to eight weeks. Production code, evaluations, security review and integration with the tools your team already uses.",
  },
  {
    title: "Launch",
    body: "We roll out to a small group first, watch the metrics with you, then open it up to everyone.",
  },
  {
    title: "Run",
    body: "Monitoring, model upgrades and improvements on a monthly retainer, or a full handover with documentation.",
  },
];

export const pricing = [
  {
    name: "Scoping sprint",
    price: "$6,000",
    cadence: "fixed, 1 week",
    summary: "For teams that know they want AI but not where to start.",
    points: [
      "Workflow and data review",
      "Ranked list of opportunities",
      "Cost and risk estimate",
      "Working prototype of the top pick",
    ],
  },
  {
    name: "Build",
    price: "$25,000+",
    cadence: "per project, 4 to 8 weeks",
    summary: "For one well-defined agent, assistant or product feature.",
    points: [
      "Production-ready software",
      "Evaluations and guardrails",
      "Integrations with your tools",
      "30 days of post-launch support",
      "Full source code and docs",
    ],
    featured: true,
  },
  {
    name: "Embedded team",
    price: "$12,000",
    cadence: "per month",
    summary: "For companies shipping AI features continuously.",
    points: [
      "Two engineers and a product lead",
      "Weekly releases",
      "Monitoring and model upgrades",
      "Cancel with 30 days notice",
    ],
  },
];

export const testimonials = [
  {
    quote:
      "They told us which two of our five ideas weren't worth building. That alone paid for the engagement. The agent they did build handles a third of our inbound volume.",
    name: "Maya Okafor",
    role: "COO, Northline Logistics",
  },
  {
    quote:
      "Every sprint ended with something I could click on. I never had to guess how the project was going.",
    name: "Daniel Reyes",
    role: "VP Product, Kestrel Finance",
  },
  {
    quote:
      "Our staff were skeptical. After the first week, they were the ones asking what else it could take off their plate.",
    name: "Dr. Priya Raman",
    role: "Operations Director, Harbor Health",
  },
];

export const team = [
  { name: "Alex Moreau", role: "Founder, engineering", note: "Ex-staff engineer on a large search team" },
  { name: "Sana Iqbal", role: "Head of AI", note: "Evaluation and model selection" },
  { name: "Tomás Rivera", role: "Product and delivery", note: "Runs scoping and rollout" },
  { name: "Lena Fischer", role: "Design", note: "Interfaces people trust" },
];

export const faqs = [
  {
    q: "Do we need to have our data in order first?",
    a: "No. Part of the scoping sprint is finding out what you have and what's usable. We've started projects from shared inboxes and spreadsheets.",
  },
  {
    q: "Which models do you use?",
    a: "Whichever fits the job and your constraints. We compare options on your own data, and we build so that switching models later is a config change, not a rewrite.",
  },
  {
    q: "Where does our data go?",
    a: "We can work with providers that don't train on your data, deploy inside your cloud account, or use self-hosted models when the data can't leave. We'll sign an NDA and a DPA before you share anything.",
  },
  {
    q: "How do you handle the AI getting things wrong?",
    a: "We measure it. Every project has an evaluation set built from your real cases, confidence thresholds, and a clear path to a person for anything uncertain.",
  },
  {
    q: "Who owns what you build?",
    a: "You do. You get the full source code, documentation and infrastructure access at the end of every project.",
  },
  {
    q: "What if we only need a small thing?",
    a: "Say so on the call. If a no-code tool or an off-the-shelf product will do, we'll tell you that and point you to it.",
  },
];
