/* =========================================================
   CareerPath — Static content (careers, assessment, roadmap)
   Ubah file ini untuk menambah karier, pertanyaan, atau tahap belajar.
   ========================================================= */

window.CP_DATA = {
  careers: [
    {
      id: "data-analyst",
      family: "data",
      name: "Data Analyst",
      icon: "⌘",
      tagline: "Turn information into meaningful decisions.",
      skills: ["Analytical thinking", "SQL", "Visualization"],
      activities:
        "Explore datasets, prepare reports, build dashboards, and communicate findings to support decisions.",
      firstStep:
        "Create a small portfolio project that demonstrates your thinking, process, and results.",
      keywords: ["sql", "excel", "python", "tableau", "power bi", "statistics"],
    },
    {
      id: "business-analyst",
      family: "business",
      name: "Business Analyst",
      icon: "◇",
      tagline: "Connect business needs with better solutions.",
      skills: ["Communication", "Research", "Problem solving"],
      activities:
        "Gather requirements, map business processes, compare options, and help teams agree on practical improvements.",
      firstStep:
        "Document a real process you know well, identify one bottleneck, and propose a measurable improvement.",
      keywords: ["requirements", "stakeholder", "process", "excel", "sql", "communication"],
    },
    {
      id: "ux-designer",
      family: "design",
      name: "UX Designer",
      icon: "▧",
      tagline: "Create useful, thoughtful digital experiences.",
      skills: ["Design thinking", "Figma", "User research"],
      activities:
        "Interview users, map their journeys, sketch wireframes, build prototypes, and test designs before they are built.",
      firstStep:
        "Redesign one screen of an app you use, then explain the problem, your research, and the design decisions.",
      keywords: ["figma", "user research", "prototype", "wireframe", "usability", "design thinking"],
    },
  ],

  /* Setiap opsi memberi poin pada satu career family */
  questions: [
    {
      text: "Which activity sounds most interesting?",
      options: [
        { label: "Finding patterns in data", family: "data" },
        { label: "Understanding business problems", family: "business" },
        { label: "Designing digital experiences", family: "design" },
      ],
    },
    {
      text: "When you face a difficult problem, what do you do first?",
      options: [
        { label: "Look for numbers that explain what is happening", family: "data" },
        { label: "Talk to the people involved to understand their needs", family: "business" },
        { label: "Sketch possible solutions to see what works", family: "design" },
      ],
    },
    {
      text: "Which class or task do you enjoy the most?",
      options: [
        { label: "Statistics, spreadsheets, or databases", family: "data" },
        { label: "Management, economics, or case studies", family: "business" },
        { label: "Visual design, psychology, or interaction design", family: "design" },
      ],
    },
    {
      text: "What kind of result makes you proud?",
      options: [
        { label: "A clear chart that reveals an insight", family: "data" },
        { label: "A plan that the whole team agrees on", family: "business" },
        { label: "An interface that people find easy to use", family: "design" },
      ],
    },
    {
      text: "How do you prefer to work?",
      options: [
        { label: "Focused, with time to analyse details", family: "data" },
        { label: "Collaborating across teams and discussions", family: "business" },
        { label: "Iterating quickly with feedback from users", family: "design" },
      ],
    },
    {
      text: "Which tool would you most like to master?",
      options: [
        { label: "SQL, Python, or Tableau", family: "data" },
        { label: "Process maps and requirement documents", family: "business" },
        { label: "Figma and prototyping tools", family: "design" },
      ],
    },
  ],

  roadmap: {
    title: "Analytical career foundation",
    subtitle: "Build knowledge, then demonstrate it in a portfolio.",
    steps: [
      { title: "Understand data fundamentals", text: "Practice spreadsheets, data types, and descriptive statistics." },
      { title: "Learn practical SQL", text: "Filter, group, and join example datasets." },
      { title: "Tell a story with a dashboard", text: "Explain three findings and their implications." },
      { title: "Create a portfolio project", text: "Document your question, process, results, and recommendations." },
    ],
  },

  cvSections: ["education", "experience", "skills", "project"],
};
