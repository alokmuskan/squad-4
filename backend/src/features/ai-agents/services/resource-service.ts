import type {
	AgentState,
	ResourceRecommendation,
} from "@/features/ai-agents/types/agent.types";
import { retrieveLearningResources } from "@/services/rag/retrievers";
import { searchExternalResources } from "@/services/resource-external-api";
import { SKILL_ALIASES } from "@/utils/skill-matching";

interface ResourceEntry {
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration: string;
	reason: string;
}

const SKILL_RESOURCES: Record<string, ResourceEntry[]> = {
	// --- Frontend ---
	React: [
		{
			title: "React Documentation",
			url: "https://react.dev",
			platform: "react.dev",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official React docs covering hooks, components, state management, and best practices",
		},
		{
			title: "Full Stack Open — React",
			url: "https://fullstackopen.com/en/part1",
			platform: "University of Helsinki",
			type: "course",
			difficulty: "intermediate",
			duration: "90 hours",
			reason:
				"Comprehensive free university course covering React, Redux, and modern frontend",
		},
		{
			title: "Build a Trello Clone with React",
			url: "https://youtube.com/results?search_query=build+trello+clone+react+typescript",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "4 hours",
			reason:
				"Portfolio project: drag-and-drop Kanban board with React and TypeScript",
		},
		{
			title: "React Interview Questions Practice",
			url: "https://youtube.com/results?search_query=react+interview+questions+answers+2026",
			platform: "YouTube",
			type: "video",
			difficulty: "intermediate",
			duration: "2 hours",
			reason:
				"Practice common React interview questions with detailed explanations",
		},
	],
	"Next.js": [
		{
			title: "Next.js Documentation",
			url: "https://nextjs.org/docs",
			platform: "nextjs.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Next.js docs with interactive examples and deployment guides",
		},
		{
			title: "Next.js Learn — Free Course",
			url: "https://nextjs.org/learn",
			platform: "nextjs.org",
			type: "course",
			difficulty: "beginner",
			duration: "20 hours",
			reason:
				"Official free Next.js course covering App Router, auth, databases, and deployment",
		},
		{
			title: "Build a SaaS with Next.js",
			url: "https://youtube.com/results?search_query=build+saas+nextjs+full+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "advanced",
			duration: "6 hours",
			reason:
				"Full-stack SaaS project with payments, auth, and database integration",
		},
	],
	TypeScript: [
		{
			title: "TypeScript Handbook",
			url: "https://typescriptlang.org/docs/handbook",
			platform: "typescriptlang.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official TypeScript handbook covering basic types to advanced patterns",
		},
		{
			title: "TypeScript Deep Dive",
			url: "https://basarat.gitbook.io/typescript",
			platform: "GitBook",
			type: "book",
			difficulty: "intermediate",
			duration: "30 hours",
			reason:
				"In-depth TypeScript guide covering type system, compiler, and patterns",
		},
		{
			title: "type-challenges",
			url: "https://github.com/type-challenges/type-challenges",
			platform: "GitHub",
			type: "project",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "200+ graded TypeScript type challenges used by top companies",
		},
	],
	JavaScript: [
		{
			title: "JavaScript.info",
			url: "https://javascript.info",
			platform: "javascript.info",
			type: "tutorial",
			difficulty: "beginner",
			duration: "50 hours",
			reason:
				"Modern JavaScript tutorial from basics to advanced with interactive tasks",
		},
		{
			title: "You Don't Know JS",
			url: "https://github.com/getify/You-Dont-Know-JS",
			platform: "GitHub",
			type: "book",
			difficulty: "intermediate",
			duration: "40 hours",
			reason: "Deep dive into JavaScript core mechanics and advanced concepts",
		},
		{
			title: "JavaScript 30",
			url: "https://javascript30.com",
			platform: "JavaScript30",
			type: "course",
			difficulty: "intermediate",
			duration: "30 hours",
			reason: "30 vanilla JS projects in 30 days to master DOM, APIs, and ES6+",
		},
	],
	CSS: [
		{
			title: "CSS-Tricks Complete Guide to Grid",
			url: "https://css-tricks.com/snippets/css/complete-guide-grid",
			platform: "CSS-Tricks",
			type: "tutorial",
			difficulty: "beginner",
			duration: "3 hours",
			reason: "Complete visual guide to CSS Grid with interactive examples",
		},
		{
			title: "CSS-Tricks Flexbox Guide",
			url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox",
			platform: "CSS-Tricks",
			type: "tutorial",
			difficulty: "beginner",
			duration: "2 hours",
			reason: "Visual guide to Flexbox with real-world layout patterns",
		},
		{
			title: "Tailwind CSS Documentation",
			url: "https://tailwindcss.com/docs",
			platform: "tailwindcss.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Utility-first CSS framework docs with responsive design examples",
		},
	],
	HTML: [
		{
			title: "MDN HTML Documentation",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
			platform: "MDN",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official MDN HTML reference with examples and browser compatibility",
		},
		{
			title: "FreeCodeCamp Responsive Web Design",
			url: "https://freecodecamp.org/learn/responsive-web-design",
			platform: "freeCodeCamp",
			type: "course",
			difficulty: "beginner",
			duration: "300 hours",
			reason:
				"Free responsive web design certification with hands-on HTML/CSS projects",
		},
	],
	Redux: [
		{
			title: "Redux Documentation",
			url: "https://redux.js.org",
			platform: "redux.js.org",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official Redux docs covering state management, reducers, and middleware",
		},
		{
			title: "Redux Toolkit Guide",
			url: "https://redux-toolkit.js.org",
			platform: "redux-toolkit.js.org",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "10 hours",
			reason:
				"Modern Redux with RTK Query, createSlice, and TypeScript integration",
		},
	],
	Vue: [
		{
			title: "Vue.js Documentation",
			url: "https://vuejs.org/guide",
			platform: "vuejs.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Vue.js guide covering components, reactivity, and routing",
		},
		{
			title: "Build a Vue.js E-commerce App",
			url: "https://youtube.com/results?search_query=build+ecommerce+app+vuejs+nuxt",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "5 hours",
			reason:
				"Full Vue.js project with Nuxt, state management, and payment integration",
		},
	],
	Angular: [
		{
			title: "Angular Documentation",
			url: "https://angular.dev",
			platform: "angular.dev",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Angular docs covering components, services, routing, and forms",
		},
		{
			title: "Build an Angular CRUD App",
			url: "https://youtube.com/results?search_query=angular+crud+app+tutorial+standalone",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "4 hours",
			reason:
				"Build a complete CRUD app with Angular standalone components and Firebase",
		},
	],

	// --- Backend ---
	Node: [
		{
			title: "Node.js Official Documentation",
			url: "https://nodejs.org/docs/latest/api",
			platform: "nodejs.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Official Node.js API docs covering all built-in modules",
		},
		{
			title: "Node.js Design Patterns",
			url: "https://nodejsdesignpatterns.com",
			platform: "Node.js Design Patterns",
			type: "book",
			difficulty: "advanced",
			duration: "40 hours",
			reason:
				"Comprehensive guide to Node.js design patterns and production techniques",
		},
		{
			title: "Build a REST API with Node.js",
			url: "https://youtube.com/results?search_query=build+rest+api+nodejs+express+crash+course",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "4 hours",
			reason:
				"Build a production-ready REST API with Express, JWT auth, and database",
		},
		{
			title: "Build a Real-time Chat App",
			url: "https://youtube.com/results?search_query=nodejs+socketio+realtime+chat+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason: "Portfolio project: real-time chat with WebSockets and Node.js",
		},
	],
	Express: [
		{
			title: "Express.js Documentation",
			url: "https://expressjs.com",
			platform: "expressjs.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Express.js docs with routing, middleware, and error handling guides",
		},
		{
			title: "Express.js Crash Course",
			url: "https://youtube.com/results?search_query=express+js+crash+course+2026",
			platform: "YouTube",
			type: "video",
			difficulty: "beginner",
			duration: "3 hours",
			reason:
				"Quick Express.js crash course covering routing, middleware, and APIs",
		},
	],
	"REST APIs": [
		{
			title: "REST API Best Practices",
			url: "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design",
			platform: "Stack Overflow Blog",
			type: "article",
			difficulty: "intermediate",
			duration: "1 hour",
			reason:
				"Industry best practices for REST API design from the Stack Overflow team",
		},
		{
			title: "OpenAPI Specification Guide",
			url: "https://swagger.io/docs/specification/about",
			platform: "Swagger",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official OpenAPI specification guide for API design-first development",
		},
	],
	GraphQL: [
		{
			title: "GraphQL Official Learn Section",
			url: "https://graphql.org/learn",
			platform: "graphql.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official GraphQL docs covering queries, mutations, schemas, and resolvers",
		},
		{
			title: "How to GraphQL",
			url: "https://howtographql.com",
			platform: "How to GraphQL",
			type: "tutorial",
			difficulty: "beginner",
			duration: "15 hours",
			reason:
				"Free full-stack GraphQL tutorial with both frontend and backend tracks",
		},
		{
			title: "Build a GraphQL API for a Blog",
			url: "https://youtube.com/results?search_query=build+graphql+api+apollo+server+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Build a real GraphQL API with Apollo Server, data loaders, and subscriptions",
		},
	],

	// --- Languages ---
	Python: [
		{
			title: "Python Official Tutorial",
			url: "https://docs.python.org/3/tutorial",
			platform: "python.org",
			type: "documentation",
			difficulty: "beginner",
			duration: "20 hours",
			reason:
				"The official Python tutorial by the creators — the most authoritative free resource",
		},
		{
			title: "Automate the Boring Stuff with Python",
			url: "https://automatetheboringstuff.com",
			platform: "automatetheboringstuff.com",
			type: "book",
			difficulty: "beginner",
			duration: "30 hours",
			reason: "Free Python book focused on practical automation projects",
		},
		{
			title: "Real Python Tutorials",
			url: "https://realpython.com",
			platform: "Real Python",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"High-quality Python tutorials covering web, data, and automation",
		},
		{
			title: "Build a Web Scraper with Python",
			url: "https://youtube.com/results?search_query=python+web+scraper+project+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason: "Hands-on web scraping project with BeautifulSoup and Selenium",
		},
	],
	Go: [
		{
			title: "Go by Example",
			url: "https://gobyexample.com",
			platform: "Go by Example",
			type: "tutorial",
			difficulty: "beginner",
			duration: "10 hours",
			reason:
				"Learn Go through annotated example programs for every language feature",
		},
		{
			title: "Effective Go",
			url: "https://go.dev/doc/effective_go",
			platform: "go.dev",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Official Go best practices guide from the Go team at Google",
		},
		{
			title: "Build a REST API in Go",
			url: "https://youtube.com/results?search_query=build+rest+api+golang+chi+postgresql",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "4 hours",
			reason:
				"Hands-on Go API project with routing, database, authentication, and tests",
		},
	],
	Java: [
		{
			title: "Java Tutorial (Oracle)",
			url: "https://docs.oracle.com/javase/tutorial",
			platform: "Oracle",
			type: "tutorial",
			difficulty: "beginner",
			duration: "40 hours",
			reason:
				"Official Java tutorials covering core language and standard library",
		},
		{
			title: "Spring Boot Quick Start",
			url: "https://spring.io/quickstart",
			platform: "spring.io",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official Spring Boot quick start for building production Java microservices",
		},
		{
			title: "Build a CRUD App with Spring Boot",
			url: "https://youtube.com/results?search_query=spring+boot+crud+rest+api+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "4 hours",
			reason: "Full REST API with Spring Boot, JPA, Hibernate, and PostgreSQL",
		},
	],
	"C++": [
		{
			title: "LearnCpp.com",
			url: "https://learncpp.com",
			platform: "LearnCpp",
			type: "tutorial",
			difficulty: "beginner",
			duration: "60 hours",
			reason: "Comprehensive free C++ tutorial covering modern C++20 features",
		},
		{
			title: "C++ Reference (cppreference)",
			url: "https://en.cppreference.com",
			platform: "cppreference.com",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"The definitive C++ language reference with examples and compiler support",
		},
		{
			title: "Build a System Monitor in C++",
			url: "https://youtube.com/results?search_query=build+system+monitor+c%2B%2B+project",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Systems programming project with real-time data and visualization",
		},
	],
	"C#": [
		{
			title: "Microsoft C# Tutorial",
			url: "https://learn.microsoft.com/en-us/dotnet/csharp",
			platform: "Microsoft Learn",
			type: "tutorial",
			difficulty: "beginner",
			duration: "40 hours",
			reason: "Official Microsoft C# documentation with interactive tutorials",
		},
		{
			title: "Build a Desktop App with C# WinForms",
			url: "https://youtube.com/results?search_query=build+desktop+app+c%23+winforms",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Build a complete Windows desktop application using C# and WinForms",
		},
	],
	Rust: [
		{
			title: "The Rust Book",
			url: "https://doc.rust-lang.org/book",
			platform: "rust-lang.org",
			type: "book",
			difficulty: "beginner",
			duration: "40 hours",
			reason:
				"The official Rust programming language book — the best way to learn Rust",
		},
		{
			title: "Rust by Example",
			url: "https://doc.rust-lang.org/stable/rust-by-example",
			platform: "rust-lang.org",
			type: "tutorial",
			difficulty: "beginner",
			duration: "15 hours",
			reason:
				"Learn Rust through annotated examples covering ownership, lifetimes, and traits",
		},
		{
			title: "Build a CLI Tool in Rust",
			url: "https://youtube.com/results?search_query=build+cli+tool+rust+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason: "Build a production CLI tool with Rust, clap, and error handling",
		},
	],

	// --- Databases ---
	SQL: [
		{
			title: "SQL Tutorial (Mode Analytics)",
			url: "https://mode.com/sql-tutorial",
			platform: "Mode Analytics",
			type: "tutorial",
			difficulty: "beginner",
			duration: "10 hours",
			reason:
				"Interactive SQL tutorial with real data and analytics-focused exercises",
		},
		{
			title: "SQLZoo",
			url: "https://sqlzoo.net",
			platform: "SQLZoo",
			type: "tutorial",
			difficulty: "beginner",
			duration: "15 hours",
			reason: "Interactive SQL tutorial with live database exercises",
		},
		{
			title: "Use The Index, Luke",
			url: "https://use-the-index-luke.com",
			platform: "Use The Index, Luke",
			type: "book",
			difficulty: "advanced",
			duration: "20 hours",
			reason:
				"The definitive free guide to SQL indexing and query optimization",
		},
	],
	PostgreSQL: [
		{
			title: "PostgreSQL Tutorial",
			url: "https://postgresqltutorial.com",
			platform: "postgresqltutorial.com",
			type: "tutorial",
			difficulty: "beginner",
			duration: "15 hours",
			reason:
				"Complete PostgreSQL tutorial from basic queries to advanced optimization",
		},
		{
			title: "Design an E-commerce Database",
			url: "https://youtube.com/results?search_query=design+ecommerce+database+postgresql+schema",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Real-world database design with normalization, indexes, and complex queries",
		},
	],
	MongoDB: [
		{
			title: "MongoDB University",
			url: "https://learn.mongodb.com",
			platform: "MongoDB University",
			type: "course",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Free MongoDB courses from the creators with certification paths",
		},
		{
			title: "MongoDB Documentation",
			url: "https://mongodb.com/docs",
			platform: "mongodb.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official MongoDB docs covering CRUD, aggregation, indexing, and sharding",
		},
		{
			title: "Build a MERN Stack App",
			url: "https://youtube.com/results?search_query=build+mern+stack+app+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "5 hours",
			reason: "Full MERN stack project: MongoDB, Express, React, Node.js",
		},
	],
	Redis: [
		{
			title: "Redis Documentation",
			url: "https://redis.io/docs",
			platform: "redis.io",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Redis docs covering all commands, data structures, and best practices",
		},
		{
			title: "Redis University",
			url: "https://university.redis.com",
			platform: "Redis University",
			type: "course",
			difficulty: "beginner",
			duration: "20 hours",
			reason:
				"Free Redis courses with hands-on labs and certification from Redis Labs",
		},
	],

	// --- DevOps ---
	Docker: [
		{
			title: "Docker Official Getting Started Guide",
			url: "https://docs.docker.com/get-started",
			platform: "docker.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Official Docker getting-started guide with hands-on examples",
		},
		{
			title: "Docker for Beginners (Play with Docker)",
			url: "https://dockerlabs.collabnix.com",
			platform: "Docker Labs",
			type: "tutorial",
			difficulty: "beginner",
			duration: "5 hours",
			reason:
				"Free Docker labs with interactive exercises and real environment",
		},
		{
			title: "Dockerize a Full-Stack App",
			url: "https://youtube.com/results?search_query=dockerize+fullstack+app+node+react+compose",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Real-world Docker Compose project with multi-service orchestration",
		},
	],
	Kubernetes: [
		{
			title: "Kubernetes Official Tutorials",
			url: "https://kubernetes.io/docs/tutorials",
			platform: "kubernetes.io",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "10 hours",
			reason:
				"Official K8s tutorials with interactive modules and hands-on exercises",
		},
		{
			title: "Kubernetes the Hard Way",
			url: "https://github.com/kelseyhightower/kubernetes-the-hard-way",
			platform: "GitHub",
			type: "tutorial",
			difficulty: "advanced",
			duration: "8 hours",
			reason: "Bootstrap a K8s cluster from scratch to understand internals",
		},
		{
			title: "Deploy a Microservice on K8s",
			url: "https://youtube.com/results?search_query=deploy+microservice+kubernetes+helm+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "advanced",
			duration: "4 hours",
			reason: "Real-world K8s project with Helm, monitoring, and auto-scaling",
		},
	],
	AWS: [
		{
			title: "AWS Free Tier & Getting Started",
			url: "https://aws.amazon.com/free",
			platform: "AWS",
			type: "tutorial",
			difficulty: "beginner",
			duration: "Varies",
			reason: "AWS free tier with hands-on labs for core services at no cost",
		},
		{
			title: "AWS Hands-On Tutorials",
			url: "https://aws.amazon.com/getting-started/hands-on",
			platform: "AWS",
			type: "tutorial",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"100+ free AWS tutorials for deploying web apps and serverless APIs",
		},
		{
			title: "Deploy a Web App on AWS EC2",
			url: "https://youtube.com/results?search_query=deploy+nodejs+app+aws+ec2+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Practical EC2 deployment project with security and load balancing",
		},
	],
	Azure: [
		{
			title: "Microsoft Azure Free Labs",
			url: "https://learn.microsoft.com/en-us/training/azure",
			platform: "Microsoft Learn",
			type: "course",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Free Azure learning paths with hands-on labs and certifications",
		},
	],
	GCP: [
		{
			title: "Google Cloud Free Tier",
			url: "https://cloud.google.com/free",
			platform: "Google Cloud",
			type: "tutorial",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Google Cloud free tier with hands-on labs and $300 credits",
		},
		{
			title: "GCP Skills Boost",
			url: "https://cloudskillsboost.google",
			platform: "Google Cloud Skills Boost",
			type: "course",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Free Google Cloud courses with hands-on labs and quests",
		},
	],
	Terraform: [
		{
			title: "Terraform Official Tutorials",
			url: "https://developer.hashicorp.com/terraform/tutorials",
			platform: "HashiCorp",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "10 hours",
			reason: "Official Terraform tutorials for IaC and cloud provisioning",
		},
		{
			title: "Terraform Up and Running (Free Chapters)",
			url: "https://oreilly.com/library/view/terraform-up-and/9781098116736",
			platform: "O'Reilly",
			type: "book",
			difficulty: "intermediate",
			duration: "20 hours",
			reason:
				"Practical Terraform guide covering modules, state, and multi-cloud",
		},
	],
	Ansible: [
		{
			title: "Ansible Documentation",
			url: "https://docs.ansible.com",
			platform: "ansible.com",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official Ansible docs for configuration management and automation",
		},
	],
	"CI/CD": [
		{
			title: "GitHub Actions Documentation",
			url: "https://docs.github.com/en/actions",
			platform: "GitHub Docs",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official GitHub Actions docs for building automated CI/CD pipelines",
		},
		{
			title: "Build a CI/CD Pipeline for Node.js",
			url: "https://youtube.com/results?search_query=ci+cd+pipeline+github+actions+nodejs",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason:
				"Build a production CI/CD pipeline with automated testing and deployment",
		},
	],
	Jenkins: [
		{
			title: "Jenkins Documentation",
			url: "https://jenkins.io/doc",
			platform: "jenkins.io",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Official Jenkins documentation for CI/CD pipeline automation",
		},
	],

	// --- Git ---
	Git: [
		{
			title: "Pro Git Book",
			url: "https://git-scm.com/book",
			platform: "git-scm.com",
			type: "book",
			difficulty: "beginner",
			duration: "30 hours",
			reason:
				"The official Pro Git book — the most comprehensive free Git resource",
		},
		{
			title: "Learn Git Branching",
			url: "https://learngitbranching.js.org",
			platform: "Learn Git Branching",
			type: "tutorial",
			difficulty: "beginner",
			duration: "3 hours",
			reason:
				"Interactive Git branching game to master merge, rebase, and conflict resolution",
		},
		{
			title: "GitHub Skills",
			url: "https://skills.github.com",
			platform: "GitHub",
			type: "course",
			difficulty: "beginner",
			duration: "5 hours",
			reason:
				"Free interactive GitHub courses: Flow, Actions, Pages, and collaboration",
		},
	],

	// --- AI/ML ---
	"Machine Learning": [
		{
			title: "Machine Learning by Andrew Ng",
			url: "https://coursera.org/learn/machine-learning",
			platform: "Coursera",
			type: "course",
			difficulty: "intermediate",
			duration: "60 hours",
			reason: "Stanford ML course — free to audit with all video lectures",
		},
		{
			title: "Scikit-learn User Guide",
			url: "https://scikit-learn.org/stable/user_guide",
			platform: "scikit-learn.org",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official scikit-learn guide with examples for every ML algorithm",
		},
		{
			title: "Kaggle ML Competitions",
			url: "https://kaggle.com/competitions",
			platform: "Kaggle",
			type: "project",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Practice ML on real-world datasets with community notebooks and solutions",
		},
		{
			title: "MLOps Course (Made With ML)",
			url: "https://madewithml.com",
			platform: "Made With ML",
			type: "course",
			difficulty: "advanced",
			duration: "40 hours",
			reason:
				"Free MLOps course covering full ML lifecycle from data to production",
		},
	],
	"Deep Learning": [
		{
			title: "Fast.ai Practical Deep Learning",
			url: "https://course.fast.ai",
			platform: "fast.ai",
			type: "course",
			difficulty: "intermediate",
			duration: "30 hours",
			reason: "Top-down practical deep learning from cutting-edge techniques",
		},
		{
			title: "PyTorch Tutorials",
			url: "https://pytorch.org/tutorials",
			platform: "pytorch.org",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "20 hours",
			reason: "Official PyTorch tutorials covering tensors to model deployment",
		},
		{
			title: "Hugging Face NLP Course",
			url: "https://huggingface.co/learn/nlp-course",
			platform: "Hugging Face",
			type: "course",
			difficulty: "intermediate",
			duration: "20 hours",
			reason:
				"Free NLP course using Hugging Face transformers with real datasets",
		},
	],
	"Data Science": [
		{
			title: "Python for Data Analysis (Free Chapters)",
			url: "https://oreilly.com/library/view/python-for-data/9781098104023",
			platform: "O'Reilly",
			type: "book",
			difficulty: "intermediate",
			duration: "30 hours",
			reason: "Essential guide to data manipulation with Pandas and NumPy",
		},
		{
			title: "Pandas Documentation",
			url: "https://pandas.pydata.org/docs",
			platform: "pandas.pydata.org",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Official Pandas docs for data manipulation and analysis",
		},
	],
	"Apache Spark": [
		{
			title: "Spark Official Documentation",
			url: "https://spark.apache.org/docs/latest",
			platform: "Apache Spark",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Official Apache Spark docs with quick-start guide and examples",
		},
		{
			title: "dbt Learn — Analytics Engineering",
			url: "https://docs.getdbt.com/learn",
			platform: "dbt",
			type: "course",
			difficulty: "intermediate",
			duration: "15 hours",
			reason:
				"Free dbt course for analytics engineering with hands-on projects",
		},
	],

	// --- DSA ---
	"Data Structures": [
		{
			title: "Visualgo — Algorithm Visualizations",
			url: "https://visualgo.net",
			platform: "Visualgo",
			type: "tutorial",
			difficulty: "beginner",
			duration: "5 hours",
			reason: "See data structures in action with step-by-step visualizations",
		},
		{
			title: "FreeCodeCamp DSA Course",
			url: "https://youtube.com/watch?v=8hly31xKli0",
			platform: "YouTube",
			type: "course",
			difficulty: "beginner",
			duration: "8 hours",
			reason: "Free DSA course with visual explanations and coding exercises",
		},
		{
			title: "LeetCode Explore",
			url: "https://leetcode.com/explore/learn",
			platform: "LeetCode",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "40 hours",
			reason: "Interactive DSA tutorials on LeetCode with practice problems",
		},
	],
	Algorithms: [
		{
			title: "NeetCode DSA Roadmap",
			url: "https://neetcode.io/roadmap",
			platform: "NeetCode",
			type: "course",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Structured DSA roadmap with 150+ LeetCode problems by pattern",
		},
		{
			title: "Algorithms by Princeton (Coursera)",
			url: "https://coursera.org/learn/algorithms-part1",
			platform: "Coursera",
			type: "course",
			difficulty: "intermediate",
			duration: "50 hours",
			reason:
				"Free algorithms course by Princeton covering sorting, graphs, and strings",
		},
		{
			title: "Top Interview 150 on LeetCode",
			url: "https://leetcode.com/problem-list/top-interview-questions",
			platform: "LeetCode",
			type: "project",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Practice with the most common interview questions from top companies",
		},
	],
	"Object-Oriented Programming": [
		{
			title: "Refactoring Guru — Design Patterns",
			url: "https://refactoring.guru/design-patterns",
			platform: "Refactoring Guru",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "10 hours",
			reason:
				"The best free design patterns resource with UML diagrams and examples",
		},
		{
			title: "SOLID Principles Explained",
			url: "https://youtube.com/results?search_query=solid+principles+explained+with+examples",
			platform: "YouTube",
			type: "video",
			difficulty: "intermediate",
			duration: "2 hours",
			reason:
				"Clear SOLID principle explanations with real-world code examples",
		},
	],

	// --- Testing ---
	Testing: [
		{
			title: "Jest Documentation",
			url: "https://jestjs.io/docs",
			platform: "jestjs.io",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Jest docs with examples for unit and integration testing",
		},
		{
			title: "Testing Library Docs",
			url: "https://testing-library.com/docs",
			platform: "testing-library.com",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official Testing Library docs for component testing best practices",
		},
		{
			title: "FreeCodeCamp Testing Course",
			url: "https://youtube.com/results?search_query=testing+full+course+unit+integration+tdd",
			platform: "YouTube",
			type: "course",
			difficulty: "beginner",
			duration: "5 hours",
			reason: "Free testing course covering TDD, mocks, and CI/CD integration",
		},
	],
	"System Design": [
		{
			title: "System Design Primer",
			url: "https://github.com/donnemartin/system-design-primer",
			platform: "GitHub",
			type: "book",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "The most popular free system design resource with case studies",
		},
		{
			title: "System Design Interview (freecodecamp)",
			url: "https://youtube.com/watch?v=UzLhG3QvB6A",
			platform: "YouTube",
			type: "course",
			difficulty: "intermediate",
			duration: "1 hour",
			reason:
				"Free system design interview prep covering 5 real-world architectures",
		},
		{
			title: "Design a URL Shortener",
			url: "https://youtube.com/results?search_query=design+url+shortener+system+design+interview",
			platform: "YouTube",
			type: "video",
			difficulty: "intermediate",
			duration: "1 hour",
			reason: "Whiteboard walkthrough of designing a scalable URL shortener",
		},
	],

	// --- Performance ---
	"Performance Optimization": [
		{
			title: "Web Performance (web.dev)",
			url: "https://web.dev/learn-core-web-vitals",
			platform: "web.dev",
			type: "tutorial",
			difficulty: "intermediate",
			duration: "5 hours",
			reason:
				"Google's official web performance guides with optimization techniques",
		},
		{
			title: "Database Indexing Explained",
			url: "https://youtube.com/results?search_query=database+indexing+explained+deep+dive",
			platform: "YouTube",
			type: "video",
			difficulty: "intermediate",
			duration: "1 hour",
			reason: "Clear database indexing explanation with visual examples",
		},
	],

	// --- Security ---
	"Network Security": [
		{
			title: "TryHackMe — Free Labs",
			url: "https://tryhackme.com",
			platform: "TryHackMe",
			type: "course",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Free interactive cybersecurity labs with real-world scenarios",
		},
		{
			title: "OWASP Top 10",
			url: "https://owasp.org/www-project-top-ten",
			platform: "OWASP",
			type: "documentation",
			difficulty: "intermediate",
			duration: "5 hours",
			reason: "The industry standard for web application security risks",
		},
		{
			title: "Hack the Box — Free Machines",
			url: "https://hackthebox.com",
			platform: "Hack The Box",
			type: "project",
			difficulty: "intermediate",
			duration: "Varies",
			reason: "Practice penetration testing on real vulnerable machines",
		},
	],

	// --- Career ---
	"Career Planning": [
		{
			title: "Roadmap.sh",
			url: "https://roadmap.sh",
			platform: "roadmap.sh",
			type: "guide",
			difficulty: "beginner",
			duration: "Ongoing",
			reason:
				"Community-driven roadmaps with learning paths for every tech career",
		},
		{
			title: "The Odin Project",
			url: "https://theodinproject.com",
			platform: "The Odin Project",
			type: "course",
			difficulty: "beginner",
			duration: "200 hours",
			reason:
				"Free full-stack curriculum with real projects and community support",
		},
		{
			title: "FreeCodeCamp",
			url: "https://freecodecamp.org",
			platform: "freeCodeCamp",
			type: "course",
			difficulty: "beginner",
			duration: "300 hours",
			reason:
				"Free interactive coding courses with industry-recognized certifications",
		},
		{
			title: "Dev.to",
			url: "https://dev.to",
			platform: "Dev.to",
			type: "tutorial",
			difficulty: "beginner",
			duration: "Ongoing",
			reason:
				"Active developer community with thousands of free tutorials and insights",
		},
	],

	// --- Soft Skills ---
	"Problem Solving": [
		{
			title: "LeetCode Problem Solving",
			url: "https://leetcode.com/problemset",
			platform: "LeetCode",
			type: "project",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Practice algorithmic problem solving with 2000+ coding challenges",
		},
		{
			title: "Codewars",
			url: "https://codewars.com",
			platform: "Codewars",
			type: "tutorial",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Free coding challenges with community solutions and ranking system",
		},
	],
	Communication: [
		{
			title: "Write the Docs",
			url: "https://writethedocs.org/guide",
			platform: "Write the Docs",
			type: "guide",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Free guide to writing software documentation and technical communication",
		},
	],
	"API Design": [
		{
			title: "REST API Best Practices (Stack Overflow)",
			url: "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design",
			platform: "Stack Overflow Blog",
			type: "article",
			difficulty: "intermediate",
			duration: "1 hour",
			reason:
				"Industry best practices for REST API design from the Stack Overflow team",
		},
		{
			title: "OpenAPI Specification Guide",
			url: "https://swagger.io/docs/specification/about",
			platform: "Swagger",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official OpenAPI specification guide for API design-first development",
		},
	],

	// --- Additional tools ---
	Prisma: [
		{
			title: "Prisma Documentation",
			url: "https://prisma.io/docs",
			platform: "prisma.io",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Prisma docs for type-safe database access and migrations",
		},
		{
			title: "Build a CRUD API with Prisma",
			url: "https://youtube.com/results?search_query=prisma+crud+api+tutorial+nodejs",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason: "Build a full CRUD API using Prisma, Express, and PostgreSQL",
		},
	],
	Kafka: [
		{
			title: "Apache Kafka Documentation",
			url: "https://kafka.apache.org/documentation",
			platform: "kafka.apache.org",
			type: "documentation",
			difficulty: "intermediate",
			duration: "Varies",
			reason:
				"Official Kafka docs covering producers, consumers, streams, and connect",
		},
		{
			title: "Kafka for Beginners",
			url: "https://youtube.com/results?search_query=kafka+for+beginners+crash+course",
			platform: "YouTube",
			type: "course",
			difficulty: "beginner",
			duration: "3 hours",
			reason:
				"Kafka crash course covering topics, partitions, and event streaming",
		},
	],
	Django: [
		{
			title: "Django Documentation",
			url: "https://docs.djangoproject.com",
			platform: "djangoproject.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason: "Official Django docs with tutorials and best practices",
		},
		{
			title: "Build a Blog with Django",
			url: "https://youtube.com/results?search_query=build+blog+django+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "beginner",
			duration: "3 hours",
			reason: "Build a complete blog with Django, user auth, and admin panel",
		},
	],
	Flask: [
		{
			title: "Flask Documentation",
			url: "https://flask.palletsprojects.com",
			platform: "flask.palletsprojects.com",
			type: "documentation",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Official Flask docs with quickstart, tutorials, and API reference",
		},
		{
			title: "Build a REST API with Flask",
			url: "https://youtube.com/results?search_query=build+rest+api+flask+tutorial",
			platform: "YouTube",
			type: "project",
			difficulty: "intermediate",
			duration: "3 hours",
			reason: "Build a REST API with Flask, SQLAlchemy, and JWT authentication",
		},
	],

	default: [
		{
			title: "Roadmap.sh — Career Guides",
			url: "https://roadmap.sh",
			platform: "roadmap.sh",
			type: "guide",
			difficulty: "beginner",
			duration: "Ongoing",
			reason:
				"Community-driven roadmaps with learning paths for every tech career",
		},
		{
			title: "FreeCodeCamp",
			url: "https://freecodecamp.org",
			platform: "freecodecamp.org",
			type: "course",
			difficulty: "beginner",
			duration: "300 hours",
			reason:
				"Interactive coding tutorials with industry-recognized certifications",
		},
		{
			title: "The Odin Project",
			url: "https://theodinproject.com",
			platform: "theodinproject.com",
			type: "course",
			difficulty: "beginner",
			duration: "200 hours",
			reason: "Free full-stack curriculum with projects and community support",
		},
		{
			title: "dev.to — Developer Community",
			url: "https://dev.to",
			platform: "Dev.to",
			type: "guide",
			difficulty: "beginner",
			duration: "Ongoing",
			reason:
				"Active developer community with thousands of free tutorials and articles",
		},
		{
			title: "YouTube Free Courses",
			url: "https://youtube.com/results?search_query=free+coding+course+2026",
			platform: "YouTube",
			type: "course",
			difficulty: "beginner",
			duration: "Varies",
			reason:
				"Search YouTube for the latest free courses on any programming topic",
		},
	],
};

function normalizeForMatch(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9\s#.+]/g, "")
		.trim();
}

function findSkillKey(skill: string): string {
	const raw = skill.trim();
	const normalized = normalizeForMatch(raw);

	// 1. Direct alias match
	const alias = SKILL_ALIASES[normalized];
	if (alias) return alias;

	// 2. Word-boundary match against alias keys
	for (const [aliasKey, targetKey] of Object.entries(SKILL_ALIASES)) {
		const escaped = aliasKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const pattern = new RegExp(`\\b${escaped}\\b`);
		if (pattern.test(normalized)) {
			if (normalized.length >= 3 && aliasKey.length >= 3) {
				return targetKey;
			}
		}
	}

	// 3. Exact match on SKILL_RESOURCES keys
	const keys = Object.keys(SKILL_RESOURCES);
	for (const key of keys) {
		if (key === "C++" || key === "C#" || key === "default") continue;
		if (key.toLowerCase() === normalized) return key;
	}

	// 4. Word-boundary match against SKILL_RESOURCES keys
	for (const key of keys) {
		if (key === "default") continue;
		const keyLower = key.toLowerCase();
		const escaped = keyLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const pattern = new RegExp(`\\b${escaped}\\b`);
		if (pattern.test(normalized)) {
			if (normalized.length >= 3 && keyLower.length >= 3) {
				return key;
			}
		}
	}

	return "";
}

export async function resourceRecommendationNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	const skillGap = state.skillGapResult;
	if (
		!skillGap ||
		(skillGap.weak.length === 0 && skillGap.improving.length === 0)
	) {
		return { resourceRecommendations: [] };
	}

	const priorityMap = new Map<string, number>();
	for (const gap of skillGap.priorityGaps || []) {
		const weight =
			gap.importance === "high" ? 3 : gap.importance === "medium" ? 2 : 1;
		priorityMap.set(gap.skill.toLowerCase(), weight);
	}

	const allGaps: { skill: string; isWeak: boolean; priority: number }[] = [
		...skillGap.weak.map((s) => ({
			skill: s,
			isWeak: true,
			priority: priorityMap.get(s.toLowerCase()) ?? 2,
		})),
		...skillGap.improving.map((s) => ({
			skill: s,
			isWeak: false,
			priority: priorityMap.get(s.toLowerCase()) ?? 1,
		})),
	];

	allGaps.sort((a, b) => b.priority - a.priority || (a.isWeak ? -1 : 1));

	const allResources: ResourceRecommendation[] = [];
	const seenUrls = new Set<string>();

	for (const { skill, isWeak, priority } of allGaps) {
		try {
			const resourcesForSkill: ResourceRecommendation[] = [];
			const targetCount = priority >= 3 ? 4 : priority === 2 ? 3 : 2;

			// Tier 1: RAG — semantic search over curated learning resources
			if (resourcesForSkill.length < targetCount) {
				const ragResults = await retrieveLearningResources(skill, targetCount, {
					difficulty: isWeak ? "beginner" : undefined,
				});
				for (const r of ragResults) {
					if (seenUrls.has(r.url)) continue;
					seenUrls.add(r.url);
					resourcesForSkill.push({
						skill,
						title: r.title,
						url: r.url,
						platform: r.platform,
						type: r.type,
						difficulty: isWeak
							? "beginner"
							: r.difficulty === "beginner"
								? "intermediate"
								: r.difficulty,
						duration: "Varies",
						reason: isWeak
							? `Critical skill gap for ${state.careerGoal} — ${r.reason}`
							: `Building toward ${state.careerGoal} — ${r.reason}`,
					});
				}
			}

			// Tier 2: Hardcoded SKILL_RESOURCES map
			if (resourcesForSkill.length < targetCount) {
				const matched = findSkillKey(skill);
				if (matched && SKILL_RESOURCES[matched]) {
					const remaining = targetCount - resourcesForSkill.length;
					const mapResources = SKILL_RESOURCES[matched].slice(0, remaining);
					for (const r of mapResources) {
						if (seenUrls.has(r.url)) continue;
						seenUrls.add(r.url);
						resourcesForSkill.push({
							skill,
							title: r.title,
							url: r.url,
							platform: r.platform,
							type: r.type,
							difficulty: isWeak
								? "beginner"
								: r.difficulty === "beginner"
									? "intermediate"
									: r.difficulty,
							duration: r.duration,
							reason: isWeak
								? `Critical skill gap for ${state.careerGoal} — ${r.reason}`
								: `Building toward ${state.careerGoal} — ${r.reason}`,
						});
					}
				}
			}

			// Tier 3: External APIs (YouTube, Udemy, Dev.to)
			if (resourcesForSkill.length < targetCount) {
				const remaining = targetCount - resourcesForSkill.length;
				const externalResults = await searchExternalResources(skill, remaining);
				for (const r of externalResults) {
					if (seenUrls.has(r.url)) continue;
					seenUrls.add(r.url);
					resourcesForSkill.push({
						skill,
						title: r.title,
						url: r.url,
						platform: r.platform,
						type: r.type,
						difficulty: isWeak
							? "beginner"
							: r.difficulty === "beginner"
								? "intermediate"
								: r.difficulty,
						duration: r.duration || "Varies",
						reason: isWeak
							? `Critical skill gap for ${state.careerGoal} — ${r.reason}`
							: `Building toward ${state.careerGoal} — ${r.reason}`,
					});
				}
			}

			// Tier 4: Generic fallback — YouTube + FreeCodeCamp search URLs
			if (resourcesForSkill.length < targetCount) {
				const searchQuery = encodeURIComponent(`${skill} tutorial 2026 free`);
				const fallbacks = [
					{
						skill,
						title: `Learn ${skill} — Free Beginner Course`,
						url: `https://youtube.com/results?search_query=${searchQuery}`,
						platform: "YouTube",
						type: "course",
						difficulty: "beginner",
						duration: "Varies",
						reason: isWeak
							? `High-priority gap — start learning ${skill} for ${state.careerGoal}`
							: `Continue building ${skill} proficiency for ${state.careerGoal}`,
					} as ResourceRecommendation,
					{
						skill,
						title: `${skill} Project Ideas & Practice`,
						url: `https://youtube.com/results?search_query=${encodeURIComponent(`${skill} project for portfolio`)}`,
						platform: "YouTube",
						type: "project",
						difficulty: "beginner",
						duration: "Varies",
						reason: `Apply ${skill} with hands-on portfolio projects`,
					} as ResourceRecommendation,
					{
						skill,
						title: `FreeCodeCamp — ${skill} Articles`,
						url: `https://freecodecamp.org/news/search/?query=${encodeURIComponent(skill)}`,
						platform: "freeCodeCamp",
						type: "tutorial",
						difficulty: "beginner",
						duration: "Varies",
						reason: `Free interactive tutorials for ${skill}`,
					} as ResourceRecommendation,
				];
				for (const fb of fallbacks) {
					if (resourcesForSkill.length >= targetCount) break;
					if (seenUrls.has(fb.url)) continue;
					seenUrls.add(fb.url);
					resourcesForSkill.push(fb);
				}
			}

			allResources.push(...resourcesForSkill);
		} catch (err: unknown) {
			console.error(
				`Resource agent failed for skill "${skill}":`,
				err instanceof Error ? err.message : String(err),
			);
			allResources.push({
				skill,
				title: `Explore ${skill} Resources`,
				url: `https://youtube.com/results?search_query=${encodeURIComponent(`${skill} course free`)}`,
				platform: "YouTube",
				type: "guide",
				difficulty: "beginner",
				duration: "Varies",
				reason: `Recommended skill for ${state.careerGoal}`,
			});
		}
	}

	if (skillGap.projectIdeas && skillGap.projectIdeas.length > 0) {
		for (const idea of skillGap.projectIdeas) {
			const searchQuery = encodeURIComponent(idea + " tutorial");
			allResources.push({
				skill: state.careerGoal,
				title: idea,
				url: `https://youtube.com/results?search_query=${searchQuery}`,
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				duration: "Varies",
				reason: `Portfolio project to demonstrate ${state.careerGoal} skills`,
			});
		}
	}

	return { resourceRecommendations: allResources };
}
