"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Compass, Pen, Palette, Code, Layers, Brain,
  RotateCcw, Sparkles, Trophy, MapPin, ChevronDown, ChevronUp,
  Link2, Lightbulb, Clock, CheckCircle2, Circle, Loader2,
  Database, Globe, Shield, BarChart3, Cpu, Server,
  GitBranch, Smartphone, Cloud, Terminal, Camera, 
} from "lucide-react";


// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "done" | "inProgress" | "upcoming";

interface Resource {
  label: string;
  url: string;
}

interface RoadmapStop {
  id: number;
  label: string;
  phase: string;
  duration: string;
  side: "left" | "right";
  defaultStatus: Status;
  icon: React.ElementType;
  skills: string[];
  tip: string;
  description: string;
  resources: Resource[];
  weeklyGoal: string;
}

// ─── Roadmap Data ─────────────────────────────────────────────────────────────

const ROADMAPS: Record<string, RoadmapStop[]> = {
  "UI/UX Designer": [
    {
      id: 1, label: "Design Foundations", phase: "Week 1–2", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: BookOpen,
      description: "Get comfortable with visual design theory and the tools every UX designer uses daily.",
      skills: ["Gestalt Principles", "Color Theory", "Typography Basics", "Figma Essentials"],
      tip: "Figma has a free plan — start recreating real app screens to build muscle memory fast.",
      weeklyGoal: "Recreate 3 existing app screens in Figma from scratch.",
      resources: [
        { label: "Figma Crash Course – YouTube", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8" },
        { label: "The Design of Everyday Things (Book)", url: "https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654" },
        { label: "Google UX Design Certificate – Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
        { label: "Laws of UX – Quick Reference", url: "https://lawsofux.com" },
        { label: "Figma Official Learn Hub", url: "https://www.figma.com/resources/learn-design/" },
        { label: "Canva Design School – Color Theory", url: "https://www.canva.com/learn/color-theory/" },
      ],
    },
    {
      id: 2, label: "User Research", phase: "Week 3–4", duration: "2 weeks",
      side: "right", defaultStatus: "done", icon: Compass,
      description: "Learn how to discover what users actually need — not what they say they need.",
      skills: ["Interviews", "Surveys", "Affinity Mapping", "Empathy Maps", "User Personas"],
      tip: "Talk to at least 5 real people about a problem space before designing anything.",
      weeklyGoal: "Conduct 3 user interviews and synthesize findings into a persona.",
      resources: [
        { label: "Nielsen Norman Group – Research Methods", url: "https://www.nngroup.com/articles/which-ux-research-methods/" },
        { label: "Just Enough Research (Book)", url: "https://abookapart.com/products/just-enough-research" },
        { label: "UX Research Cheat Sheet – NNGroup", url: "https://www.nngroup.com/articles/ux-research-cheat-sheet/" },
        { label: "Maze – Free User Research Templates", url: "https://maze.co/templates/" },
        { label: "Interviewing Users (Book)", url: "https://www.amazon.com/Interviewing-Users-Uncover-Compelling-Insights/dp/193382011X" },
        { label: "How to Run a Card Sort – UXPin", url: "https://www.uxpin.com/studio/blog/card-sorting-in-ux-research/" },
      ],
    },
    {
      id: 3, label: "Wireframing & IA", phase: "Week 5–7", duration: "3 weeks",
      side: "left", defaultStatus: "inProgress", icon: Pen,
      description: "Structure information and map user flows before adding any visual polish.",
      skills: ["User Flows", "Sitemaps", "Lo-fi Wireframes", "Card Sorting", "Navigation Patterns"],
      tip: "Use pencil and paper first — speed of iteration beats digital fidelity at this stage.",
      weeklyGoal: "Build a complete lo-fi wireframe for a 5-screen mobile app.",
      resources: [
        { label: "Information Architecture for the Web (Book)", url: "https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/" },
        { label: "Wireframing in Figma – Coursera", url: "https://www.coursera.org/learn/wireframes-low-fidelity-prototypes" },
        { label: "User Flow Design Guide – Overflow", url: "https://overflow.io/blog/user-flow-diagrams/" },
        { label: "Optimal Workshop – Card Sorting Tool", url: "https://www.optimalworkshop.com" },
        { label: "Miro Wireframe Templates", url: "https://miro.com/templates/wireframe/" },
        { label: "NNGroup – Navigation Design Patterns", url: "https://www.nngroup.com/articles/navigation-ia-tested/" },
      ],
    },
    {
      id: 4, label: "Visual UI Design", phase: "Week 8–11", duration: "4 weeks",
      side: "right", defaultStatus: "upcoming", icon: Palette,
      description: "Apply visual craft — spacing, hierarchy, component systems — to make interfaces beautiful and consistent.",
      skills: ["Design Systems", "Component Libraries", "Auto Layout", "Responsive Grids", "Dark Mode"],
      tip: "Master Figma Auto Layout — it's the single skill that separates junior from mid-level designers.",
      weeklyGoal: "Build a 10-component design system with light and dark variants.",
      resources: [
        { label: "Refactoring UI (Book)", url: "https://www.refactoringui.com" },
        { label: "Design Systems – designsystems.com", url: "https://www.designsystems.com" },
        { label: "Figma Auto Layout Tutorial", url: "https://www.youtube.com/watch?v=TyaGpGDFczw" },
        { label: "Google Material Design 3", url: "https://m3.material.io" },
        { label: "Apple Human Interface Guidelines", url: "https://developer.apple.com/design/human-interface-guidelines/" },
        { label: "Mobbin – UI Pattern Library", url: "https://mobbin.com" },
      ],
    },
    {
      id: 5, label: "Prototyping & Testing", phase: "Week 12–14", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: Layers,
      description: "Turn your designs into clickable prototypes and test them with real users to validate decisions.",
      skills: ["Hi-fi Prototyping", "Usability Testing", "A/B Testing", "Heatmaps", "Iteration Loops"],
      tip: "5-second tests reveal what users actually see first — run them before any formal usability test.",
      weeklyGoal: "Run a moderated usability test with 5 participants and document findings.",
      resources: [
        { label: "Maze – Remote Testing Tool", url: "https://maze.co" },
        { label: "Rocket Surgery Made Easy (Book)", url: "https://www.amazon.com/Rocket-Surgery-Made-Easy-Yourself/dp/0321657292" },
        { label: "UsabilityHub – 5-Second Tests", url: "https://usabilityhub.com" },
        { label: "Lookback – Moderated User Testing", url: "https://lookback.com" },
        { label: "NNGroup – Usability Testing 101", url: "https://www.nngroup.com/articles/usability-testing-101/" },
        { label: "A/B Testing Guide – Optimizely", url: "https://www.optimizely.com/optimization-glossary/ab-testing/" },
      ],
    },
    {
      id: 6, label: "Portfolio & Job Prep", phase: "Week 15–16", duration: "2 weeks",
      side: "right", defaultStatus: "upcoming", icon: Trophy,
      description: "Package your work into a portfolio that tells a compelling story about your design process.",
      skills: ["Case Study Writing", "Portfolio Site", "Interview Prep", "Design Challenges"],
      tip: "Show your thinking, not just the final screens. Recruiters care most about your process.",
      weeklyGoal: "Publish 2 full case studies with problem → research → design → outcome structure.",
      resources: [
        { label: "UX Portfolio Examples – Bestfolios", url: "https://www.bestfolios.com/home" },
        { label: "How to Write a UX Case Study – NNGroup", url: "https://www.nngroup.com/articles/ux-case-studies/" },
        { label: "Notion UX Portfolio Template", url: "https://www.notion.so/templates/ux-portfolio" },
        { label: "UX Interview Questions – Toptal", url: "https://www.toptal.com/designers/ux/interview-questions" },
        { label: "Dribbble – Portfolio Inspiration", url: "https://dribbble.com" },
        { label: "ADPList – Free UX Mentorship", url: "https://adplist.org" },
      ],
    },
  ],

  "Frontend Developer": [
    {
      id: 1, label: "HTML & CSS", phase: "Week 1–2", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: Code,
      description: "Build the structural and visual layer of every web page — the foundation you'll use forever.",
      skills: ["Semantic HTML5", "CSS Box Model", "Flexbox", "CSS Grid", "Responsive Design"],
      tip: "Understand CSS specificity deeply — it prevents 90% of layout bugs you'll face later.",
      weeklyGoal: "Clone the layout of 2 real websites using only HTML and CSS.",
      resources: [
        { label: "The Odin Project – HTML & CSS", url: "https://www.theodinproject.com" },
        { label: "CSS Tricks – Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
        { label: "freeCodeCamp – Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
        { label: "CSS Flexbox Froggy (Interactive)", url: "https://flexboxfroggy.com" },
        { label: "MDN Web Docs – HTML Reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        { label: "Kevin Powell – CSS YouTube Channel", url: "https://www.youtube.com/@KevinPowell" },
      ],
    },
    {
      id: 2, label: "JavaScript Core", phase: "Week 3–5", duration: "3 weeks",
      side: "right", defaultStatus: "inProgress", icon: Terminal,
      description: "Master the language of the web — how data flows, how events work, and how to manipulate the DOM.",
      skills: ["Variables & Scope", "Functions & Closures", "Async/Await", "DOM Manipulation", "Fetch API"],
      tip: "Read 'You Don't Know JS' even before you think you need it. It prevents deeply rooted misconceptions.",
      weeklyGoal: "Build a weather app using the OpenWeatherMap API with no framework.",
      resources: [
        { label: "javascript.info – Modern JS Tutorial", url: "https://javascript.info" },
        { label: "You Don't Know JS (Free Book)", url: "https://github.com/getify/You-Dont-Know-JS" },
        { label: "Eloquent JavaScript (Free Book)", url: "https://eloquentjavascript.net" },
        { label: "JS30 – 30 Day Vanilla JS Challenge", url: "https://javascript30.com" },
        { label: "MDN – Async JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous" },
        { label: "Traversy Media – JS Crash Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c" },
      ],
    },
    {
      id: 3, label: "React & TypeScript", phase: "Week 6–9", duration: "4 weeks",
      side: "left", defaultStatus: "upcoming", icon: Layers,
      description: "Learn the component model and type safety that power most modern frontend codebases.",
      skills: ["JSX", "Hooks (useState, useEffect)", "React Router", "TypeScript Basics", "Context API"],
      tip: "Start typing your props from day one — retrofitting TypeScript into untyped React is painful.",
      weeklyGoal: "Build a typed todo app with routing, local state, and an external API.",
      resources: [
        { label: "React Docs (Official)", url: "https://react.dev" },
        { label: "Total TypeScript – Free Tutorials", url: "https://www.totaltypescript.com" },
        { label: "TypeScript Handbook (Official)", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
        { label: "React Router v6 Docs", url: "https://reactrouter.com/en/main" },
        { label: "Scrimba – Learn React for Free", url: "https://scrimba.com/learn/learnreact" },
        { label: "Josh W. Comeau – Joy of React (Course)", url: "https://www.joyofreact.com" },
      ],
    },
    {
      id: 4, label: "Tooling & State", phase: "Week 10–12", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: GitBranch,
      description: "Learn the build tools, state managers, and testing practices used in real-world teams.",
      skills: ["Vite", "Zustand / Redux Toolkit", "React Query", "Vitest", "Git Workflows"],
      tip: "React Query eliminates 80% of useEffect data-fetching complexity. Learn it early.",
      weeklyGoal: "Migrate an existing project to use React Query and write 10 unit tests.",
      resources: [
        { label: "TanStack Query Docs", url: "https://tanstack.com/query/latest" },
        { label: "Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/" },
        { label: "Vite Official Docs", url: "https://vitejs.dev/guide/" },
        { label: "Zustand GitHub & Docs", url: "https://github.com/pmndrs/zustand" },
        { label: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org" },
        { label: "Vitest – Unit Testing Guide", url: "https://vitest.dev/guide/" },
      ],
    },
    {
      id: 5, label: "Performance & Accessibility", phase: "Week 13–15", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: BarChart3,
      description: "Make your apps fast and usable by everyone — essential for production-grade work.",
      skills: ["Core Web Vitals", "Code Splitting", "WCAG 2.1", "Lighthouse", "SEO Basics"],
      tip: "Run Lighthouse on every project before considering it done. Aim for 90+ across all categories.",
      weeklyGoal: "Optimize an existing app to hit 90+ Lighthouse score in all four categories.",
      resources: [
        { label: "web.dev – Performance Learning Path", url: "https://web.dev/learn/performance/" },
        { label: "WebAIM – Accessibility Fundamentals", url: "https://webaim.org/intro/" },
        { label: "Google Lighthouse Docs", url: "https://developer.chrome.com/docs/lighthouse/overview/" },
        { label: "Core Web Vitals – Google", url: "https://web.dev/vitals/" },
        { label: "A11y Project – Accessibility Checklist", url: "https://www.a11yproject.com/checklist/" },
        { label: "Smashing Magazine – Performance Guide", url: "https://www.smashingmagazine.com/guides/performance/" },
      ],
    },
    {
      id: 6, label: "Portfolio Projects", phase: "Week 16–18", duration: "2 weeks",
      side: "right", defaultStatus: "upcoming", icon: Globe,
      description: "Ship real projects that demonstrate the full range of your frontend skills to employers.",
      skills: ["Project Planning", "Deployment (Vercel/Netlify)", "README Writing", "GitHub Profile"],
      tip: "Quality over quantity — 2 polished projects beat 10 half-finished ones every time.",
      weeklyGoal: "Deploy one full-stack project with auth, an API, and a custom domain.",
      resources: [
        { label: "Vercel Deployment Docs", url: "https://vercel.com/docs" },
        { label: "freeCodeCamp – How to Build a Dev Portfolio", url: "https://www.freecodecamp.org/news/how-to-build-an-impressive-portfolio-site/" },
        { label: "Netlify Deployment Guide", url: "https://docs.netlify.com" },
        { label: "GitHub Pages Docs", url: "https://pages.github.com" },
        { label: "Brittany Chiang – Portfolio Inspiration", url: "https://brittanychiang.com" },
        { label: "Frontend Mentor – Real Project Challenges", url: "https://www.frontendmentor.io" },
      ],
    },
  ],

  "AI / ML Engineer": [
    {
      id: 1, label: "Python & Math", phase: "Week 1–3", duration: "3 weeks",
      side: "left", defaultStatus: "done", icon: Brain,
      description: "Build the programming and mathematical foundations that all ML work is built on.",
      skills: ["Python OOP", "NumPy & Pandas", "Linear Algebra", "Calculus Basics", "Statistics"],
      tip: "You don't need a PhD-level math background — but you do need to understand matrix multiplication intuitively.",
      weeklyGoal: "Implement linear regression from scratch using only NumPy — no sklearn.",
      resources: [
        { label: "fast.ai – Practical Deep Learning (Free)", url: "https://course.fast.ai" },
        { label: "3Blue1Brown – Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        { label: "Python for Everybody – Coursera (Free)", url: "https://www.coursera.org/specializations/python" },
        { label: "Khan Academy – Statistics & Probability", url: "https://www.khanacademy.org/math/statistics-probability" },
        { label: "NumPy Official Documentation", url: "https://numpy.org/doc/stable/" },
        { label: "Pandas – 10 Minutes to Pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html" },
      ],
    },
    {
      id: 2, label: "Classic ML", phase: "Week 4–7", duration: "4 weeks",
      side: "right", defaultStatus: "inProgress", icon: BarChart3,
      description: "Learn the algorithms that still power most production ML systems today.",
      skills: ["Regression", "Classification", "Scikit-learn", "Feature Engineering", "Model Evaluation"],
      tip: "Always split data before any preprocessing — data leakage is the #1 beginner mistake in ML.",
      weeklyGoal: "Build and evaluate 3 models on a Kaggle dataset, documenting what improved accuracy.",
      resources: [
        { label: "Kaggle Learn – Machine Learning", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
        { label: "Hands-On ML with Scikit-Learn (Book)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/" },
        { label: "Scikit-learn Official Docs", url: "https://scikit-learn.org/stable/user_guide.html" },
        { label: "StatQuest – ML Concepts (YouTube)", url: "https://www.youtube.com/@statquest" },
        { label: "Google ML Crash Course (Free)", url: "https://developers.google.com/machine-learning/crash-course" },
        { label: "Kaggle – Feature Engineering Course", url: "https://www.kaggle.com/learn/feature-engineering" },
      ],
    },
    {
      id: 3, label: "Deep Learning", phase: "Week 8–12", duration: "5 weeks",
      side: "left", defaultStatus: "upcoming", icon: Layers,
      description: "Understand neural networks at a deep level — the engine behind modern AI breakthroughs.",
      skills: ["PyTorch", "CNNs", "RNNs", "Backpropagation", "Transfer Learning", "Batch Normalization"],
      tip: "Build every architecture from scratch at least once before using high-level APIs. You'll understand errors 10x faster.",
      weeklyGoal: "Train a CNN image classifier on CIFAR-10 to >85% accuracy using PyTorch.",
      resources: [
        { label: "Deep Learning Specialization – Coursera", url: "https://www.coursera.org/specializations/deep-learning" },
        { label: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/" },
        { label: "Andrej Karpathy – Neural Networks from Scratch", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
        { label: "Deep Learning Book – Goodfellow (Free)", url: "https://www.deeplearningbook.org" },
        { label: "fast.ai Part 2 – Deep Learning Foundations", url: "https://course.fast.ai/Lessons/part2.html" },
        { label: "Papers With Code – CIFAR-10 Benchmarks", url: "https://paperswithcode.com/sota/image-classification-on-cifar-10" },
      ],
    },
    {
      id: 4, label: "NLP & Transformers", phase: "Week 13–17", duration: "5 weeks",
      side: "right", defaultStatus: "upcoming", icon: Cpu,
      description: "Master the transformer architecture and the LLMs reshaping what software can do.",
      skills: ["Tokenization", "Attention Mechanism", "HuggingFace", "Fine-tuning", "RAG", "Prompt Engineering"],
      tip: "Read the original 'Attention Is All You Need' paper at least twice. Everything in modern AI comes from it.",
      weeklyGoal: "Fine-tune a small language model on a custom dataset and compare outputs before/after.",
      resources: [
        { label: "HuggingFace NLP Course (Free)", url: "https://huggingface.co/learn/nlp-course/chapter1/1" },
        { label: "Attention Is All You Need (Paper)", url: "https://arxiv.org/abs/1706.03762" },
        { label: "Andrej Karpathy – Let's Build GPT (YouTube)", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY" },
        { label: "LangChain Docs – RAG Guide", url: "https://python.langchain.com/docs/tutorials/rag/" },
        { label: "Anthropic Prompt Engineering Guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
        { label: "HuggingFace – Fine-Tuning Tutorial", url: "https://huggingface.co/docs/transformers/training" },
      ],
    },
    {
      id: 5, label: "MLOps & Deployment", phase: "Week 18–21", duration: "4 weeks",
      side: "left", defaultStatus: "upcoming", icon: Cloud,
      description: "Learn to ship models into production and keep them healthy over time.",
      skills: ["FastAPI", "Docker", "MLflow", "Model Monitoring", "CI/CD for ML", "Vector DBs"],
      tip: "A model that isn't deployed is a science experiment, not a product. Treat deployment as part of the job.",
      weeklyGoal: "Containerize and deploy an ML model as a REST API with basic monitoring.",
      resources: [
        { label: "MLflow Official Docs", url: "https://mlflow.org/docs/latest/index.html" },
        { label: "Full Stack Deep Learning (Free Course)", url: "https://fullstackdeeplearning.com" },
        { label: "FastAPI Docs – Build ML APIs", url: "https://fastapi.tiangolo.com" },
        { label: "Pinecone – Vector DB Guide", url: "https://www.pinecone.io/learn/vector-database/" },
        { label: "Made With ML – MLOps Course", url: "https://madewithml.com" },
        { label: "Evidently AI – Model Monitoring", url: "https://www.evidentlyai.com" },
      ],
    },
    {
      id: 6, label: "Capstone & Portfolio", phase: "Week 22–24", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Trophy,
      description: "Build an end-to-end ML project that demonstrates real-world problem-solving ability.",
      skills: ["Problem Scoping", "Data Collection", "Research Writing", "GitHub Portfolio", "Arxiv Reading"],
      tip: "Pick a problem where you can get your own data. Original data is more impressive than benchmark datasets.",
      weeklyGoal: "Publish a complete ML project on GitHub with a detailed README and demo.",
      resources: [
        { label: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" },
        { label: "Papers With Code – State of the Art", url: "https://paperswithcode.com" },
        { label: "Arxiv – ML Preprints", url: "https://arxiv.org/list/cs.LG/recent" },
        { label: "Weights & Biases – Experiment Tracking", url: "https://wandb.ai/site" },
        { label: "GitHub – Awesome ML Projects", url: "https://github.com/josephmisiti/awesome-machine-learning" },
        { label: "DataTalks.Club – Free MLOps Zoomcamp", url: "https://datatalks.club/blog/mlops-zoomcamp.html" },
      ],
    },
  ],

  "Backend Developer": [
    {
      id: 1, label: "Core Language", phase: "Week 1–3", duration: "3 weeks",
      side: "left", defaultStatus: "done", icon: Terminal,
      description: "Master one backend language deeply — everything else builds on language fundamentals.",
      skills: ["Node.js / Python / Go", "Type Systems", "Error Handling", "Modules & Packages", "Testing Basics"],
      tip: "Don't switch languages. Pick one, go deep. Fluency in one beats dabbling in five.",
      weeklyGoal: "Build a CLI tool from scratch using your chosen language with tests.",
      resources: [
        { label: "Node.js Official Docs", url: "https://nodejs.org/en/docs/" },
        { label: "Python Docs – Standard Library Tour", url: "https://docs.python.org/3/tutorial/stdlib.html" },
        { label: "Go Tour – Interactive Go Tutorial", url: "https://go.dev/tour/welcome/1" },
        { label: "The Odin Project – NodeJS Path", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs" },
        { label: "Fireship – Node.js in 100 Seconds", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4" },
        { label: "Codecademy – Learn Node.js (Free)", url: "https://www.codecademy.com/learn/learn-node-js" },
      ],
    },
    {
      id: 2, label: "APIs & HTTP", phase: "Week 4–6", duration: "3 weeks",
      side: "right", defaultStatus: "done", icon: Globe,
      description: "Learn to design and build robust REST APIs — the communication layer between frontend and data.",
      skills: ["REST Principles", "Express / FastAPI", "Middleware", "Auth with JWT", "API Versioning"],
      tip: "Design your API contract before writing a single line of handler code — it saves massive refactoring.",
      weeklyGoal: "Build a fully authenticated REST API with CRUD operations and input validation.",
      resources: [
        { label: "REST API Design Best Practices – freeCodeCamp", url: "https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/" },
        { label: "Express.js Official Docs", url: "https://expressjs.com" },
        { label: "FastAPI Official Docs", url: "https://fastapi.tiangolo.com" },
        { label: "JWT.io – JWT Introduction", url: "https://jwt.io/introduction" },
        { label: "Hoppscotch – Free API Testing Tool", url: "https://hoppscotch.io" },
        { label: "Swagger / OpenAPI Specification", url: "https://swagger.io/specification/" },
      ],
    },
    {
      id: 3, label: "Databases", phase: "Week 7–9", duration: "3 weeks",
      side: "left", defaultStatus: "inProgress", icon: Database,
      description: "Understand how data is stored, queried, and optimized — the backbone of every application.",
      skills: ["PostgreSQL", "SQL Queries", "Prisma / Sequelize", "Indexing", "Transactions", "Redis"],
      tip: "Learn to read EXPLAIN ANALYZE output. It's the single best tool for debugging slow queries.",
      weeklyGoal: "Design a normalized schema for an e-commerce app and write 10 complex queries.",
      resources: [
        { label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com" },
        { label: "Prisma Docs", url: "https://www.prisma.io/docs" },
        { label: "SQLZoo – Interactive SQL Learning", url: "https://sqlzoo.net" },
        { label: "Redis University – Free Courses", url: "https://university.redis.com" },
        { label: "Use The Index, Luke – SQL Indexing Guide", url: "https://use-the-index-luke.com" },
        { label: "Supabase – PostgreSQL in Practice", url: "https://supabase.com/docs" },
      ],
    },
    {
      id: 4, label: "System Design", phase: "Week 10–12", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Server,
      description: "Learn to architect systems that scale — queues, caching, microservices, and load balancing.",
      skills: ["Caching Patterns", "Message Queues", "Horizontal Scaling", "Load Balancers", "Rate Limiting"],
      tip: "Most apps don't need microservices. Start with a monolith. Split only when you hit a real boundary.",
      weeklyGoal: "Design the system architecture for a URL shortener handling 1M req/day, with diagrams.",
      resources: [
        { label: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
        { label: "ByteByteGo Newsletter & Blog", url: "https://blog.bytebytego.com" },
        { label: "Designing Data-Intensive Applications (Book)", url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" },
        { label: "AWS Architecture Center", url: "https://aws.amazon.com/architecture/" },
        { label: "Martin Fowler – Microservices Guide", url: "https://martinfowler.com/articles/microservices.html" },
        { label: "System Design Interview – Roadmap.sh", url: "https://roadmap.sh/system-design" },
      ],
    },
    {
      id: 5, label: "Security & DevOps", phase: "Week 13–15", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: Shield,
      description: "Secure your systems and learn to ship and operate them reliably in the cloud.",
      skills: ["OWASP Top 10", "OAuth 2.0", "Docker", "CI/CD Pipelines", "Logging & Monitoring"],
      tip: "Treat secrets management from day one. Hard-coded credentials in git are a career event.",
      weeklyGoal: "Containerize an app, set up a CI pipeline, and add structured logging.",
      resources: [
        { label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
        { label: "Docker Getting Started", url: "https://docs.docker.com/get-started/" },
        { label: "Auth0 – OAuth 2.0 & OpenID Connect", url: "https://auth0.com/intro-to-iam/what-is-oauth-2" },
        { label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
        { label: "Pino – Fast Node.js Logger", url: "https://getpino.io" },
        { label: "Troy Hunt – Web Security Blog", url: "https://www.troyhunt.com" },
      ],
    },
    {
      id: 6, label: "Portfolio & Interviews", phase: "Week 16–18", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Trophy,
      description: "Practice the technical interviews and ship projects that prove you can build real systems.",
      skills: ["LeetCode Patterns", "Behavioral Interviews", "GitHub Presence", "Take-Home Projects"],
      tip: "Learn Neetcode's 150 problem patterns rather than grinding random LeetCode questions.",
      weeklyGoal: "Solve 3 medium LeetCode problems daily and contribute to one open-source project.",
      resources: [
        { label: "Neetcode 150 – Problem Patterns", url: "https://neetcode.io/practice" },
        { label: "Backend Interview Questions (GitHub)", url: "https://github.com/arialdomartini/Back-End-Developer-Interview-Questions" },
        { label: "Roadmap.sh – Backend Developer Path", url: "https://roadmap.sh/backend" },
        { label: "Pramp – Free Mock Interviews", url: "https://www.pramp.com" },
        { label: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org" },
        { label: "LeetCode – Top Interview 150", url: "https://leetcode.com/studyplan/top-interview-150/" },
      ],
    },
  ],

  "Mobile Developer": [
    {
      id: 1, label: "Platform Foundations", phase: "Week 1–2", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: Smartphone,
      description: "Understand mobile platform constraints and set up your development environment.",
      skills: ["React Native / Flutter", "Expo Setup", "Mobile Navigation", "Platform Differences"],
      tip: "Use Expo for your first 3 months — it removes the setup complexity so you can focus on learning.",
      weeklyGoal: "Build and deploy a simple app to a real device using Expo Go.",
      resources: [
        { label: "Expo Documentation", url: "https://docs.expo.dev" },
        { label: "React Native Official Docs", url: "https://reactnative.dev/docs/getting-started" },
        { label: "Flutter Official Docs", url: "https://docs.flutter.dev/get-started/install" },
        { label: "Roadmap.sh – React Native Path", url: "https://roadmap.sh/react-native" },
        { label: "Simon Grimm – Ionic / Expo YouTube", url: "https://www.youtube.com/@simongrimm" },
        { label: "Snack – Expo in the Browser", url: "https://snack.expo.dev" },
      ],
    },
    {
      id: 2, label: "UI & Gestures", phase: "Week 3–5", duration: "3 weeks",
      side: "right", defaultStatus: "done", icon: Palette,
      description: "Build touch-native UIs that feel fluid and platform-appropriate.",
      skills: ["StyleSheet API", "FlatList", "Gesture Handler", "Reanimated", "Safe Areas"],
      tip: "Test on a real device from day one. The simulator lies about performance and feel.",
      weeklyGoal: "Build a swipeable card list with animated transitions and haptic feedback.",
      resources: [
        { label: "React Native Reanimated Docs", url: "https://docs.swmansion.com/react-native-reanimated/" },
        { label: "William Candillon – YouTube (Animations)", url: "https://www.youtube.com/@wcandillon" },
        { label: "React Native Gesture Handler Docs", url: "https://docs.swmansion.com/react-native-gesture-handler/" },
        { label: "NativeWind – Tailwind for RN", url: "https://www.nativewind.dev" },
        { label: "Shopify – RN Performance Series", url: "https://shopify.engineering/react-native-performance-series-part-1" },
        { label: "Lottie for React Native – Animations", url: "https://github.com/lottie-react-native/lottie-react-native" },
      ],
    },
    {
      id: 3, label: "State & Navigation", phase: "Week 6–8", duration: "3 weeks",
      side: "left", defaultStatus: "inProgress", icon: GitBranch,
      description: "Master navigation patterns and state management for multi-screen mobile apps.",
      skills: ["React Navigation", "Zustand", "Deep Linking", "Tab & Stack Navigators", "Async Storage"],
      tip: "Set up deep linking early — it's painful to retrofit and affects discoverability.",
      weeklyGoal: "Build a multi-tab app with nested navigation and persistent user state.",
      resources: [
        { label: "React Navigation Docs", url: "https://reactnavigation.org/docs/getting-started" },
        { label: "Zustand GitHub & Docs", url: "https://github.com/pmndrs/zustand" },
        { label: "MMKV – Fast RN Storage", url: "https://github.com/mrousavy/react-native-mmkv" },
        { label: "Expo Router – File-Based Navigation", url: "https://expo.github.io/router/docs/" },
        { label: "TanStack Query for React Native", url: "https://tanstack.com/query/latest/docs/framework/react/react-native" },
        { label: "Deep Linking in React Native Guide", url: "https://reactnative.dev/docs/linking" },
      ],
    },
    {
      id: 4, label: "Native Features & APIs", phase: "Week 9–11", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Camera,
      description: "Integrate device hardware and platform APIs that make mobile apps feel native.",
      skills: ["Camera & Media", "Push Notifications", "Location Services", "Biometrics", "Background Tasks"],
      tip: "Handle permission denial gracefully — it's a common reason apps get 1-star reviews.",
      weeklyGoal: "Build a feature that uses camera, notifications, and location in one app.",
      resources: [
        { label: "Expo Sensors & Camera Docs", url: "https://docs.expo.dev/versions/latest/sdk/sensors/" },
        { label: "Expo Push Notifications Guide", url: "https://docs.expo.dev/push-notifications/overview/" },
        { label: "React Native Maps", url: "https://github.com/react-native-maps/react-native-maps" },
        { label: "Expo Location Docs", url: "https://docs.expo.dev/versions/latest/sdk/location/" },
        { label: "React Native Biometrics", url: "https://github.com/SelfLender/react-native-biometrics" },
        { label: "Firebase – Mobile Backend Guide", url: "https://firebase.google.com/docs/guides" },
      ],
    },
    {
      id: 5, label: "Performance & Testing", phase: "Week 12–14", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: BarChart3,
      description: "Profile, optimize, and test your apps to ensure they work on low-end devices.",
      skills: ["Flipper", "Hermes Engine", "Detox E2E Testing", "Memory Profiling", "Bundle Size"],
      tip: "Always test on a low-end Android device. Most of your real users don't have a flagship phone.",
      weeklyGoal: "Profile your app with Flipper, fix 2 performance bottlenecks, and write 5 Detox tests.",
      resources: [
        { label: "React Native Performance Docs", url: "https://reactnative.dev/docs/performance" },
        { label: "Detox E2E Testing Framework", url: "https://wix.github.io/Detox/" },
        { label: "Flipper – Mobile Debugger", url: "https://fbflipper.com" },
        { label: "React Native Testing Library", url: "https://callstack.github.io/react-native-testing-library/" },
        { label: "Hermes Engine Docs", url: "https://hermesengine.dev" },
        { label: "Sentry for React Native – Error Tracking", url: "https://docs.sentry.io/platforms/react-native/" },
      ],
    },
    {
      id: 6, label: "App Store & Launch", phase: "Week 15–16", duration: "2 weeks",
      side: "right", defaultStatus: "upcoming", icon: Trophy,
      description: "Ship your app to both stores and learn the review process and distribution.",
      skills: ["App Store Connect", "Google Play Console", "OTA Updates", "Analytics", "ASO"],
      tip: "Write your App Store listing before you build — it clarifies the value prop and forces scope.",
      weeklyGoal: "Submit a completed app to both the App Store and Google Play.",
      resources: [
        { label: "App Store Review Guidelines", url: "https://developer.apple.com/app-store/review/guidelines/" },
        { label: "EAS Build – Expo", url: "https://docs.expo.dev/build/introduction/" },
        { label: "Google Play Console Help", url: "https://support.google.com/googleplay/android-developer/" },
        { label: "Mixpanel – Mobile Analytics", url: "https://mixpanel.com/blog/mobile-analytics/" },
        { label: "App Store Optimization Guide – AppFollow", url: "https://appfollow.io/blog/app-store-optimization-guide" },
        { label: "CodePush – OTA Updates", url: "https://github.com/microsoft/code-push" },
      ],
    },
  ],

  "DevOps Engineer": [
    {
      id: 1, label: "Linux & Networking", phase: "Week 1–3", duration: "3 weeks",
      side: "left", defaultStatus: "done", icon: Terminal,
      description: "Master the command line and understand how systems communicate over networks.",
      skills: ["Bash Scripting", "File Permissions", "SSH", "TCP/IP", "DNS", "Firewalls"],
      tip: "Learn vim at a basic level. You will be dropped into vim at 2am with no alternative.",
      weeklyGoal: "Write a bash script that automates server setup from scratch.",
      resources: [
        { label: "Linux Command Line (Free Book)", url: "https://linuxcommand.org/tlcl.php" },
        { label: "Networking for Beginners – YouTube", url: "https://www.youtube.com/watch?v=qiQR5rTSshw" },
        { label: "OverTheWire – Bandit Linux Wargame", url: "https://overthewire.org/wargames/bandit/" },
        { label: "Bash Scripting Tutorial – Ryan's Tutorials", url: "https://ryanstutorials.net/bash-scripting-tutorial/" },
        { label: "Linux Journey – Interactive Learning", url: "https://linuxjourney.com" },
        { label: "Vim Adventures – Learn Vim Interactively", url: "https://vim-adventures.com" },
      ],
    },
    {
      id: 2, label: "Containers & Docker", phase: "Week 4–5", duration: "2 weeks",
      side: "right", defaultStatus: "done", icon: Cloud,
      description: "Package and isolate applications so they run identically in every environment.",
      skills: ["Dockerfile", "Docker Compose", "Image Layers", "Registries", "Container Networking"],
      tip: "Keep images small — use multi-stage builds and non-root users from the start.",
      weeklyGoal: "Containerize a full-stack app with Docker Compose including a database.",
      resources: [
        { label: "Play With Docker (Free Lab)", url: "https://labs.play-with-docker.com" },
        { label: "Docker Official Tutorial", url: "https://docs.docker.com/get-started/" },
        { label: "Dockerfile Best Practices", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/" },
        { label: "Docker Compose Docs", url: "https://docs.docker.com/compose/" },
        { label: "Ivan Velichko – Container Learning", url: "https://iximiuz.com/en/" },
        { label: "DockerHub – Official Image Registry", url: "https://hub.docker.com" },
      ],
    },
    {
      id: 3, label: "CI/CD Pipelines", phase: "Week 6–8", duration: "3 weeks",
      side: "left", defaultStatus: "inProgress", icon: GitBranch,
      description: "Automate the build, test, and deploy lifecycle so teams ship faster with fewer errors.",
      skills: ["GitHub Actions", "Pipeline Stages", "Automated Testing", "Artifact Management", "Branch Strategies"],
      tip: "Start with a simple pipeline that just runs tests. Add complexity only when the team feels the pain.",
      weeklyGoal: "Build a CI/CD pipeline that tests, builds, and deploys to a cloud VPS on every merge.",
      resources: [
        { label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
        { label: "CI/CD Best Practices – Atlassian", url: "https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment" },
        { label: "GitLab CI/CD Docs", url: "https://docs.gitlab.com/ee/ci/" },
        { label: "CircleCI – CI/CD Tutorial", url: "https://circleci.com/docs/getting-started/" },
        { label: "Trunk-Based Development Guide", url: "https://trunkbaseddevelopment.com" },
        { label: "Semaphore CI – Concepts Blog", url: "https://semaphoreci.com/blog/cicd-pipeline" },
      ],
    },
    {
      id: 4, label: "Kubernetes", phase: "Week 9–12", duration: "4 weeks",
      side: "right", defaultStatus: "upcoming", icon: Server,
      description: "Orchestrate containers at scale — the industry standard for production workloads.",
      skills: ["Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets", "Helm Charts", "HPA"],
      tip: "Learn kubectl until it's muscle memory. You will live in it.",
      weeklyGoal: "Deploy a multi-service app on a local k3s cluster with health checks and auto-scaling.",
      resources: [
        { label: "Kubernetes Official Tutorial", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
        { label: "Killer Shell – CKA Practice Exam", url: "https://killer.sh" },
        { label: "k3s – Lightweight Kubernetes", url: "https://k3s.io" },
        { label: "Helm Docs – Package Manager for K8s", url: "https://helm.sh/docs/" },
        { label: "Play With Kubernetes (Free Lab)", url: "https://labs.play-with-k8s.com" },
        { label: "Kubesimplify – K8s YouTube Series", url: "https://www.youtube.com/@kubesimplify" },
      ],
    },
    {
      id: 5, label: "Cloud & IaC", phase: "Week 13–15", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: Cloud,
      description: "Provision and manage cloud infrastructure as code — reproducible, reviewable, automated.",
      skills: ["AWS / GCP / Azure Basics", "Terraform", "IAM & Least Privilege", "VPC Networking", "Cost Optimization"],
      tip: "Set billing alerts on day one of any cloud account. Expensive mistakes happen fast.",
      weeklyGoal: "Provision a full VPC with ECS/EKS using Terraform with no manual console steps.",
      resources: [
        { label: "Terraform Official Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" },
        { label: "AWS Free Tier", url: "https://aws.amazon.com/free/" },
        { label: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/" },
        { label: "Pulumi – IaC with Real Languages", url: "https://www.pulumi.com/docs/" },
        { label: "Cloud Guru – AWS Certifications", url: "https://acloudguru.com" },
        { label: "Google Cloud Skills Boost (Free)", url: "https://cloudskillsboost.google" },
      ],
    },
    {
      id: 6, label: "Monitoring & SRE", phase: "Week 16–18", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: BarChart3,
      description: "Observe, alert, and respond to production systems — keeping things running when they break.",
      skills: ["Prometheus & Grafana", "Log Aggregation", "SLOs & SLAs", "Incident Response", "Runbooks"],
      tip: "Define your SLOs before your first incident, not after. The first outage is too late to learn.",
      weeklyGoal: "Set up Prometheus + Grafana with custom dashboards and PagerDuty alerting.",
      resources: [
        { label: "Grafana Fundamentals Course", url: "https://grafana.com/tutorials/grafana-fundamentals/" },
        { label: "Google SRE Book (Free)", url: "https://sre.google/sre-book/table-of-contents/" },
        { label: "Prometheus Docs", url: "https://prometheus.io/docs/introduction/overview/" },
        { label: "PagerDuty Incident Response Guide", url: "https://response.pagerduty.com" },
        { label: "OpenTelemetry Docs", url: "https://opentelemetry.io/docs/" },
        { label: "Datadog – Free Trial + Learning Center", url: "https://www.datadoghq.com/learn/" },
      ],
    },
  ],

  "Data Engineer": [
    {
      id: 1, label: "SQL & Data Modeling", phase: "Week 1–3", duration: "3 weeks",
      side: "left", defaultStatus: "done", icon: Database,
      description: "Master SQL and relational data modeling — the most durable skill in data engineering.",
      skills: ["Advanced SQL", "Window Functions", "Star Schema", "Normalization", "Query Optimization"],
      tip: "If you can write a complex window function without looking it up, you're ahead of 80% of candidates.",
      weeklyGoal: "Write 20 complex SQL queries on a real dataset including CTEs and window functions.",
      resources: [
        { label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
        { label: "SQL for Data Scientists (Book)", url: "https://www.wiley.com/en-us/SQL+for+Data+Scientists-p-9781119669364" },
        { label: "SQLZoo – Interactive SQL Practice", url: "https://sqlzoo.net" },
        { label: "PostgreSQL Window Functions Guide", url: "https://www.postgresql.org/docs/current/tutorial-window.html" },
        { label: "Kimball Group – Data Modeling Techniques", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" },
        { label: "DBT Fundamentals – Free Course", url: "https://courses.getdbt.com/courses/fundamentals" },
      ],
    },
    {
      id: 2, label: "Python for Data", phase: "Week 4–5", duration: "2 weeks",
      side: "right", defaultStatus: "done", icon: Code,
      description: "Use Python to transform, clean, and move data programmatically.",
      skills: ["Pandas", "Data Cleaning", "File Formats (Parquet, CSV, JSON)", "APIs", "Scripting"],
      tip: "Learn Parquet early. It's what everything in modern data engineering actually runs on.",
      weeklyGoal: "Build an ETL script that pulls from an API, cleans data with Pandas, and writes Parquet.",
      resources: [
        { label: "Pandas Documentation", url: "https://pandas.pydata.org/docs/" },
        { label: "Python for Data Analysis (Book – Free)", url: "https://wesmckinney.com/book/" },
        { label: "Apache Parquet Format Guide", url: "https://parquet.apache.org/docs/" },
        { label: "DuckDB – Fast Local Analytics", url: "https://duckdb.org/docs/guides/python/install" },
        { label: "Polars – Fast DataFrame Library", url: "https://docs.pola.rs" },
        { label: "freeCodeCamp – Data Analysis with Python", url: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
      ],
    },
    {
      id: 3, label: "Pipelines & ETL", phase: "Week 6–9", duration: "4 weeks",
      side: "left", defaultStatus: "inProgress", icon: Layers,
      description: "Build reliable, observable data pipelines that move and transform data at scale.",
      skills: ["Apache Airflow", "dbt", "Pipeline Orchestration", "Data Contracts", "Error Handling"],
      tip: "Treat your data pipelines with the same rigor as application code — tests, versioning, code review.",
      weeklyGoal: "Build an Airflow DAG that runs a dbt transformation pipeline on a schedule.",
      resources: [
        { label: "dbt Learn – Free Course", url: "https://courses.getdbt.com/collections" },
        { label: "Airflow Official Tutorial", url: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html" },
        { label: "Prefect Docs – Modern Pipeline Orchestration", url: "https://docs.prefect.io" },
        { label: "DataTalks.Club – Data Engineering Zoomcamp", url: "https://datatalks.club/blog/data-engineering-zoomcamp.html" },
        { label: "dbt Docs – Testing & Documentation", url: "https://docs.getdbt.com/docs/build/tests" },
        { label: "Dagster Docs – Asset-Based Pipelines", url: "https://docs.dagster.io/getting-started" },
      ],
    },
    {
      id: 4, label: "Data Warehousing", phase: "Week 10–12", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Database,
      description: "Learn the warehousing platforms and modeling patterns behind analytics at scale.",
      skills: ["BigQuery / Snowflake", "Dimensional Modeling", "Slowly Changing Dimensions", "Partitioning"],
      tip: "Partitioning and clustering in BigQuery can reduce query costs by 100x. Learn it on day one.",
      weeklyGoal: "Build a star schema in BigQuery using dbt with proper documentation and tests.",
      resources: [
        { label: "BigQuery Free Sandbox", url: "https://cloud.google.com/bigquery/docs/sandbox" },
        { label: "The Data Warehouse Toolkit (Book)", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/" },
        { label: "Snowflake Free Trial + Tutorials", url: "https://www.snowflake.com/en/data-cloud/snowflake-free-trial/" },
        { label: "dbt + BigQuery Quickstart", url: "https://docs.getdbt.com/docs/get-started-dbt" },
        { label: "Google – Data Warehouse Modernization Guide", url: "https://cloud.google.com/solutions/data-warehouse-modernization" },
        { label: "Metabase – Open Source BI for Warehouses", url: "https://www.metabase.com/docs/latest/" },
      ],
    },
    {
      id: 5, label: "Streaming Data", phase: "Week 13–15", duration: "3 weeks",
      side: "left", defaultStatus: "upcoming", icon: Cpu,
      description: "Process real-time data streams — the backbone of fraud detection, recommendations, and monitoring.",
      skills: ["Apache Kafka", "Flink / Spark Streaming", "Event Sourcing", "Exactly-Once Semantics"],
      tip: "Understand the difference between at-least-once and exactly-once delivery before touching production.",
      weeklyGoal: "Build a Kafka consumer pipeline that processes events in real-time with deduplication.",
      resources: [
        { label: "Confluent Kafka Tutorials", url: "https://developer.confluent.io/tutorials/" },
        { label: "Streaming Systems (Book)", url: "https://www.oreilly.com/library/view/streaming-systems/9781491983867/" },
        { label: "Apache Flink Official Docs", url: "https://nightlies.apache.org/flink/flink-docs-stable/" },
        { label: "Redpanda – Kafka-Compatible Streaming", url: "https://docs.redpanda.com" },
        { label: "Kafka: The Definitive Guide (Free)", url: "https://www.confluent.io/resources/kafka-the-definitive-guide/" },
        { label: "Databricks – Spark Streaming Guide", url: "https://docs.databricks.com/en/structured-streaming/index.html" },
      ],
    },
    {
      id: 6, label: "Data Quality & Portfolio", phase: "Week 16–18", duration: "3 weeks",
      side: "right", defaultStatus: "upcoming", icon: Trophy,
      description: "Ensure data you produce is trustworthy, and ship a portfolio project end-to-end.",
      skills: ["Great Expectations", "Data Observability", "Lineage Tracking", "Portfolio Project"],
      tip: "A personal data project with real public data (NYC Taxi, OpenWeatherMap) outperforms toy datasets.",
      weeklyGoal: "Publish a complete data pipeline on GitHub: ingestion → transform → warehouse → dashboard.",
      resources: [
        { label: "Great Expectations Docs", url: "https://docs.greatexpectations.io" },
        { label: "Awesome Data Engineering (GitHub)", url: "https://github.com/igorbarinov/awesome-data-engineering" },
        { label: "Monte Carlo – Data Observability Guide", url: "https://www.montecarlodata.com/blog-what-is-data-observability/" },
        { label: "NYC TLC Trip Data – Real Public Dataset", url: "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page" },
        { label: "Data Engineering Weekly Newsletter", url: "https://www.dataengineeringweekly.com" },
        { label: "Seattle Data Guy – DE Portfolio Guide", url: "https://www.youtube.com/@SeattleDataGuy" },
      ],
    },
  ],
};

// ─── Color map per stop index ─────────────────────────────────────────────────

const STOP_COLORS: Record<number, { card: string; node: string; badge: string; glow: string }> = {
  1: { card: "bg-emerald-950 border-emerald-500", node: "from-emerald-500 to-teal-400", badge: "bg-emerald-500/20 text-emerald-300", glow: "shadow-emerald-500/30" },
  2: { card: "bg-blue-950 border-blue-500", node: "from-blue-500 to-sky-400", badge: "bg-blue-500/20 text-blue-300", glow: "shadow-blue-500/30" },
  3: { card: "bg-orange-950 border-orange-500", node: "from-orange-500 to-amber-400", badge: "bg-orange-500/20 text-orange-300", glow: "shadow-orange-500/30" },
  4: { card: "bg-purple-950 border-purple-500", node: "from-purple-500 to-violet-400", badge: "bg-purple-500/20 text-purple-300", glow: "shadow-purple-500/30" },
  5: { card: "bg-pink-950 border-pink-500", node: "from-pink-500 to-rose-400", badge: "bg-pink-500/20 text-pink-300", glow: "shadow-pink-500/30" },
  6: { card: "bg-yellow-950 border-yellow-500", node: "from-yellow-500 to-orange-400", badge: "bg-yellow-500/20 text-yellow-300", glow: "shadow-yellow-500/30" },
};

const STATUS_META: Record<Status, { icon: React.ElementType; label: string; color: string }> = {
  done:       { icon: CheckCircle2, label: "Completed",   color: "text-emerald-400" },
  inProgress: { icon: Loader2,      label: "In Progress", color: "text-blue-400"    },
  upcoming:   { icon: Circle,       label: "Upcoming",    color: "text-slate-500"   },
};

// ─── TimelineNode ─────────────────────────────────────────────────────────────

function TimelineNode({
  stop, status, onStatusChange,
}: {
  stop: RoadmapStop;
  status: Status;
  onStatusChange: (id: number, s: Status) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const Icon = stop.icon;
  const colors = STOP_COLORS[stop.id] ?? STOP_COLORS[1];
  const StatusIcon = STATUS_META[status].icon;
  const isLeft = stop.side === "left";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start mb-24 ${isLeft ? "justify-start" : "justify-end"}`}
    >
      {/* Card */}
      <div className={`w-[44%] ${isLeft ? "mr-auto pr-8" : "ml-auto pl-8"}`}>
        <Card className={`rounded-2xl border text-white shadow-2xl ${colors.card} ${colors.glow} transition-all duration-300`}>
          <CardContent className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{stop.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{stop.phase}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 shrink-0 ${STATUS_META[status].color}`}>
                <StatusIcon className={`w-3.5 h-3.5 ${status === "inProgress" ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{STATUS_META[status].label}</span>
              </div>
            </div>

            {/* Duration & weekly goal */}
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="text-xs text-gray-400">{stop.duration}</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-400 truncate">{stop.weeklyGoal.split(" ").slice(0, 5).join(" ")}…</span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 leading-relaxed mb-3">{stop.description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {stop.skills.map((skill) => (
                <span key={skill} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                  {skill}
                </span>
              ))}
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 pt-1 border-t border-white/5"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />Details & Resources</>}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {/* Weekly goal */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">Weekly Goal</p>
                      <p className="text-xs text-gray-200 leading-relaxed">{stop.weeklyGoal}</p>
                    </div>

                    {/* Pro tip */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-200 leading-relaxed">{stop.tip}</p>
                    </div>

                    {/* Resources */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">Resources</p>
                      <div className="space-y-1.5">
                        {stop.resources.map((r) => (
                          <a
                            key={r.label}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Link2 className="w-3 h-3 shrink-0" />
                            {r.label}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Status cycle */}
                    <div className="flex gap-2 pt-1">
                      {(["done", "inProgress", "upcoming"] as Status[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => onStatusChange(stop.id, s)}
                          className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-all font-medium ${
                            status === s
                              ? "bg-white/15 border-white/30 text-white"
                              : "border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Central node */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20">
        {status === "inProgress" && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.node} opacity-40 blur-md scale-150 animate-pulse`} />
        )}
        <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${colors.node} shadow-xl flex items-center justify-center border-2 border-white/20`}>
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 whitespace-nowrap">
          {stop.id}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LearningTimeline() {
  const [userRole, setUserRole] = useState("UI/UX Designer");
  const stops = ROADMAPS[userRole];

  const initStatus = (roadmap: RoadmapStop[]) => {
    const m: Record<number, Status> = {};
    roadmap.forEach((s) => { m[s.id] = s.defaultStatus; });
    return m;
  };

  const [statusMap, setStatusMap] = useState<Record<number, Status>>(initStatus(stops));

  useEffect(() => {
    setStatusMap(initStatus(ROADMAPS[userRole]));
  }, [userRole]);

  const handleStatusChange = (id: number, s: Status) => {
    setStatusMap((prev) => ({ ...prev, [id]: s }));
  };

  const doneCount = Object.values(statusMap).filter((s) => s === "done").length;
  const progressPct = Math.round((doneCount / stops.length) * 100);
  const estimatedWeeks = stops.reduce((acc, s) => acc + parseInt(s.duration), 0);

  // SVG winding path — scales with number of stops
  const pathH = stops.length * 340;
  const svgPath = stops.reduce((path, _, i) => {
    const y0 = i * 340;
    const y1 = y0 + 340;
    const cp = i % 2 === 0 ? `C 140 ${y0 + 80} 40 ${y0 + 160} 90 ${y0 + 220} C 40 ${y0 + 260} 140 ${y0 + 300} 90 ${y1}` : `C 40 ${y0 + 80} 140 ${y0 + 160} 90 ${y0 + 220} C 140 ${y0 + 260} 40 ${y0 + 300} 90 ${y1}`;
    return path + (i === 0 ? `M 90 0 ` : "") + cp + " ";
  }, "");

  return (
    <div className="min-h-screen bg-[#020B2D] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Role selector */}
        <div className="max-w-sm mx-auto mb-10">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          >
            {Object.keys(ROADMAPS).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Hero */}
        <motion.div
          key={userRole}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <Badge className="mb-3 bg-violet-600/80 text-white border-none text-xs px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1.5" />AI Generated Roadmap
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {userRole}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Your step-by-step path to landing the role</p>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mt-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stops.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Milestones</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">~{estimatedWeeks}w</p>
              <p className="text-xs text-slate-500 mt-0.5">Timeline</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{progressPct}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Complete</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <Progress value={progressPct} className="h-2 bg-slate-800" />
            <p className="text-xs text-slate-500 mt-2">
              {doneCount} of {stops.length} milestones completed
            </p>
          </div>

          <button
            onClick={() => setStatusMap(initStatus(stops))}
            className="mt-4 text-xs text-slate-500 hover:text-white transition-colors flex gap-1.5 items-center mx-auto"
          >
            <RotateCcw size={12} />Reset progress
          </button>
        </motion.div>

        {/* Timeline */}
        <div className="relative py-12">
          {/* Winding SVG road */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            width="180"
            height={pathH}
            viewBox={`0 0 180 ${pathH}`}
            fill="none"
            style={{ top: 0 }}
          >
            {/* Road shadow */}
            <path d={svgPath} stroke="#1e1b4b" strokeWidth="24" strokeLinecap="round" fill="none" />
            {/* Road fill */}
            <path d={svgPath} stroke="#4c1d95" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Road center dashes */}
            <path d={svgPath} stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeDasharray="12 20" fill="none" opacity="0.5" />
          </svg>

          <div className="relative z-10">
            {stops.map((stop) => (
              <TimelineNode
                key={`${userRole}-${stop.id}`}
                stop={stop}
                status={statusMap[stop.id]}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Goal footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 pb-10"
        >
          <div className="inline-flex flex-col items-center gap-3 bg-slate-900/60 border border-white/10 rounded-2xl px-10 py-6">
            <Trophy className="w-9 h-9 text-yellow-400" />
            <div>
              <h2 className="font-bold text-lg">End Goal</h2>
              <p className="text-sm text-gray-400 mt-0.5">Land your first role as a <span className="text-white font-medium">{userRole}</span></p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}