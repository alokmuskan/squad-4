import type { Prisma } from "@prisma/client";
import { prisma } from "@/database";
import { generateEmbedding } from "./embedding";
import { storeVectors, VECTOR_COLLECTIONS } from "./vector-store";
import { jobPostings } from "./job-postings-seed";

export async function ingestCareerProfilesToVectorStore(): Promise<void> {
	const profiles = await prisma.vectorDocument.findMany({
		where: { source: "career_profile" },
	});

	for (const profile of profiles) {
		const embedding = await generateEmbedding(profile.content);
		if (!embedding) continue;

		await storeVectors(VECTOR_COLLECTIONS.JOB_REQUIREMENTS, [
			{
				id: profile.id,
				title: profile.title,
				content: profile.content,
				embedding,
				metadata: {
					careerGoal: profile.title,
					category: "core",
					...(profile.metadata as Record<string, unknown>),
				},
			},
		]);
	}
}

export async function ingestLearningResourcesToVectorStore(): Promise<void> {
	const resources = await prisma.vectorDocument.findMany({
		where: { source: "learning_resource" },
	});

	for (const resource of resources) {
		const embedding = await generateEmbedding(resource.content);
		if (!embedding) continue;

		await storeVectors(VECTOR_COLLECTIONS.LEARNING_RESOURCES, [
			{
				id: resource.id,
				title: resource.title,
				content: resource.content,
				embedding,
				metadata: resource.metadata as Record<string, unknown>,
			},
		]);
	}
}

interface LearningResourceSeed {
	title: string;
	content: string;
	metadata: {
		url: string;
		platform: string;
		type: string;
		difficulty: string;
		skill: string;
		reason: string;
	};
}

export async function seedDefaultVectors(): Promise<void> {
	const existing = await prisma.vectorDocument.count();
	if (existing > 0) return;

	const careerProfiles = [
		{
			title: "AI / Machine Learning Engineer",
			content:
				"Core skills: Python, Machine Learning, Deep Learning, Statistics, Linear Algebra, Data Preprocessing, Model Evaluation. Tools: TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Jupyter, MLflow, CUDA. Soft skills: Research mindset, Problem decomposition, Experimentation, Technical writing. Typical timeline: 6-12 months.",
			metadata: {
				careerGoal: "AI / Machine Learning Engineer",
				category: "core",
			},
		},
		{
			title: "Frontend Engineer",
			content:
				"Core skills: JavaScript, TypeScript, HTML, CSS, React, Responsive Design, Web Performance, Accessibility. Tools: React, Next.js, Tailwind CSS, Vite, Git, Figma, Jest, Webpack. Soft skills: Attention to detail, Design sense, Collaboration, Code review. Typical timeline: 3-6 months.",
			metadata: { careerGoal: "Frontend Engineer", category: "core" },
		},
		{
			title: "Backend Engineer",
			content:
				"Core skills: REST APIs, SQL, System Design, Authentication, Database Design, Performance Optimization, API Design, Testing. Tools: PostgreSQL, MongoDB, Redis, Docker, Git, Prisma, Kubernetes, Kafka. Soft skills: Problem-solving, Documentation, Collaboration, Code review. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "Backend Engineer", category: "core" },
		},
		{
			title: "Full-Stack Developer",
			content:
				"Core skills: JavaScript, TypeScript, HTML, CSS, React, Node.js, REST APIs, SQL, System Design Basics. Tools: Git, Docker, PostgreSQL, MongoDB, Express, Next.js, Redis. Soft skills: Collaboration, Debugging, Code review, Agile delivery. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "Full-Stack Developer", category: "core" },
		},
		{
			title: "Cloud Engineer (AWS / Azure / GCP)",
			content:
				"Core skills: Cloud Architecture, Networking, Linux, Infrastructure as Code, Security Best Practices, Cost Optimization, High Availability. Tools: AWS, Azure, GCP, Terraform, CloudFormation, IAM, VPC, Kubernetes. Soft skills: Incident response, Documentation, Stakeholder communication. Typical timeline: 5-9 months.",
			metadata: {
				careerGoal: "Cloud Engineer (AWS / Azure / GCP)",
				category: "core",
			},
		},
		{
			title: "DevOps / Platform Engineer",
			content:
				"Core skills: CI/CD, Linux, Scripting, Containerization, Monitoring, Infrastructure Automation, Reliability Engineering. Tools: Docker, Kubernetes, Jenkins, GitHub Actions, Terraform, Prometheus, Grafana, Ansible. Soft skills: Automation mindset, On-call readiness, Cross-team collaboration. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "DevOps / Platform Engineer", category: "core" },
		},
		{
			title: "Data Analyst",
			content:
				"Core skills: SQL, Statistics, Data Visualization, Python, A/B Testing, Data Modeling, Business Acumen. Tools: Tableau, Power BI, Looker, Excel, R, Airflow, Spark. Soft skills: Business acumen, Storytelling with data, Attention to detail. Typical timeline: 3-6 months.",
			metadata: { careerGoal: "Data Analyst", category: "core" },
		},
		{
			title: "Data Engineer",
			content:
				"Core skills: SQL, Data Modeling, ETL/ELT, Python, Data Warehousing, Apache Spark, Data Pipeline. Tools: Airflow, dbt, Kafka, Snowflake, BigQuery, Spark, Docker, Kubernetes. Soft skills: Data quality mindset, Attention to detail, Documentation. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "Data Engineer", category: "core" },
		},
		{
			title: "Cybersecurity Specialist",
			content:
				"Core skills: Network Security, Threat Analysis, Vulnerability Assessment, Incident Response, Cryptography Basics, Security Policies, Risk Management. Tools: Wireshark, Nmap, SIEM, Burp Suite, Metasploit, Splunk, Kali Linux. Soft skills: Ethical judgment, Attention to detail, Clear reporting. Typical timeline: 6-10 months.",
			metadata: { careerGoal: "Cybersecurity Specialist", category: "core" },
		},
		{
			title: "Software Engineer (Product-Based Companies)",
			content:
				"Core skills: Data Structures, Algorithms, System Design, Object-Oriented Programming, Testing, API Design, Performance Optimization. Tools: Python, Java, C++, Git, Docker, PostgreSQL, Redis, Kafka. Soft skills: Ownership, Product thinking, Communication, Mentorship. Typical timeline: 6-12 months.",
			metadata: {
				careerGoal: "Software Engineer (Product-Based Companies)",
				category: "core",
			},
		},
		{
			title: "Mobile Developer",
			content:
				"Core skills: Swift, Kotlin, iOS, Android, REST APIs, Mobile Architecture, App Store Deployment. Tools: SwiftUI, UIKit, Jetpack Compose, React Native, Flutter, Git, Firebase. Soft skills: UI/UX sensitivity, Performance optimization, User-centric thinking. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "Mobile Developer", category: "core" },
		},
		{
			title: "Data Scientist",
			content:
				"Core skills: Statistics, Python, SQL, Machine Learning, Experimental Design, A/B Testing, Data Visualization. Tools: R, Scikit-learn, TensorFlow, PyTorch, Spark, Jupyter, Pandas. Soft skills: Scientific curiosity, Causal reasoning, Stakeholder communication. Typical timeline: 6-12 months.",
			metadata: { careerGoal: "Data Scientist", category: "core" },
		},
		{
			title: "Site Reliability Engineer (SRE)",
			content:
				"Core skills: Linux, Scripting, Monitoring, Incident Response, Reliability Engineering, Automation, Distributed Systems. Tools: Go, Python, Prometheus, Grafana, Kubernetes, Docker, Terraform. Soft skills: Incident response, On-call readiness, Calm under pressure. Typical timeline: 6-10 months.",
			metadata: { careerGoal: "Site Reliability Engineer (SRE)", category: "core" },
		},
		{
			title: "UI/UX Designer",
			content:
				"Core skills: User Research, Wireframing, Prototyping, Visual Design, Figma, Design Systems, Information Architecture. Tools: Figma, Sketch, Adobe XD, Framer, Storybook, Zeroheight, UsabilityHub. Soft skills: Empathy, Visual storytelling, Cross-functional collaboration. Typical timeline: 3-6 months.",
			metadata: { careerGoal: "UI/UX Designer", category: "core" },
		},
		{
			title: "Product Manager",
			content:
				"Core skills: Product Strategy, User Stories, Roadmapping, A/B Testing, Metrics & Analytics, Stakeholder Management, Market Research. Tools: Jira, Notion, Linear, Amplitude, Mixpanel, SQL, Figma. Soft skills: Communication, Leadership, Cross-functional collaboration, Decision-making. Typical timeline: 4-8 months.",
			metadata: { careerGoal: "Product Manager", category: "core" },
		},
		{
			title: "Forward Deployed Engineer",
			content:
				"Core skills: Full-Stack Development, API Integration, Deployment, Scripting, Problem Solving, Client Communication, SQL. Tools: Python, TypeScript, Docker, CI/CD, Terraform, Monitoring, Git. Soft skills: Client-facing communication, Rapid prototyping, Adaptability. Typical timeline: 3-6 months.",
			metadata: { careerGoal: "Forward Deployed Engineer", category: "core" },
		},
	];

	const learningResources: LearningResourceSeed[] = [
		// --- JavaScript ---
		{
			title: "JavaScript.info — The Modern JavaScript Tutorial",
			content:
				"Comprehensive JavaScript tutorial from basics to advanced: closures, promises, async/await, modules, and browser APIs.",
			metadata: {
				url: "https://javascript.info",
				platform: "javascript.info",
				type: "tutorial",
				difficulty: "beginner",
				skill: "JavaScript",
				reason:
					"The most thorough free JavaScript tutorial with interactive examples and tasks.",
			},
		},
		{
			title: "FreeCodeCamp JavaScript Course",
			content:
				"Learn JavaScript with 100+ interactive challenges covering ES6, data structures, algorithms, and OOP.",
			metadata: {
				url: "https://freecodecamp.org/learn",
				platform: "freeCodeCamp",
				type: "course",
				difficulty: "beginner",
				skill: "JavaScript",
				reason:
					"Free interactive JavaScript curriculum with certifications and hands-on projects.",
			},
		},
		{
			title: "You Don't Know JS (Book Series)",
			content:
				"Deep dive into JavaScript core mechanics: scope, closures, this, prototypes, async, and ES6 features.",
			metadata: {
				url: "https://github.com/getify/You-Dont-Know-JS",
				platform: "GitHub",
				type: "book",
				difficulty: "intermediate",
				skill: "JavaScript",
				reason:
					"Essential free book series that explains how JavaScript really works under the hood.",
			},
		},
		{
			title: "Eloquent JavaScript",
			content:
				"A modern introduction to programming with JavaScript covering fundamentals, browser, and Node.js.",
			metadata: {
				url: "https://eloquentjavascript.net",
				platform: "eloquentjavascript.net",
				type: "book",
				difficulty: "beginner",
				skill: "JavaScript",
				reason:
					"Free online book that teaches programming fundamentals through JavaScript with real projects.",
			},
		},
		{
			title: "JavaScript 30 — 30 Day Challenge",
			content:
				"Build 30 vanilla JavaScript projects in 30 days: drum kit, clock, CSS variables, array cardio, and more.",
			metadata: {
				url: "https://javascript30.com",
				platform: "JavaScript30",
				type: "course",
				difficulty: "intermediate",
				skill: "JavaScript",
				reason:
					"Hands-on project-based course by Wes Bos to master vanilla JavaScript without frameworks.",
			},
		},

		// --- TypeScript ---
		{
			title: "TypeScript Handbook",
			content:
				"Official TypeScript handbook covering basic types, generics, advanced types, modules, and configuration.",
			metadata: {
				url: "https://typescriptlang.org/docs/handbook",
				platform: "typescriptlang.org",
				type: "documentation",
				difficulty: "beginner",
				skill: "TypeScript",
				reason:
					"The official TypeScript handbook covers everything from basic types to advanced patterns.",
			},
		},
		{
			title: "TypeScript Deep Dive",
			content:
				"In-depth TypeScript guide: type system, compiler, project configuration, migration, and design patterns.",
			metadata: {
				url: "https://basarat.gitbook.io/typescript",
				platform: "GitBook",
				type: "book",
				difficulty: "intermediate",
				skill: "TypeScript",
				reason:
					"Community-driven deep dive covering TypeScript's type system and real-world patterns.",
			},
		},
		{
			title: "TypeScript Challenges (type-challenges)",
			content:
				"Collection of TypeScript type challenges from easy to extreme: implement utility types from scratch.",
			metadata: {
				url: "https://github.com/type-challenges/type-challenges",
				platform: "GitHub",
				type: "project",
				difficulty: "intermediate",
				skill: "TypeScript",
				reason:
					"Practice TypeScript's type system with 200+ graded challenges used by top companies.",
			},
		},
		{
			title: "Total TypeScript — Free Tutorials",
			content:
				"Free TypeScript tutorials covering beginners to advanced patterns with interactive exercises.",
			metadata: {
				url: "https://totaltypescript.com/tutorials",
				platform: "Total TypeScript",
				type: "tutorial",
				difficulty: "beginner",
				skill: "TypeScript",
				reason:
					"High-quality free TypeScript tutorials with interactive playground and progress tracking.",
			},
		},

		// --- React ---
		{
			title: "React Documentation (Beta)",
			content:
				"Official React docs covering components, hooks, state management, effects, refs, and performance.",
			metadata: {
				url: "https://react.dev",
				platform: "react.dev",
				type: "documentation",
				difficulty: "beginner",
				skill: "React",
				reason:
					"The official React documentation is the best place to start learning React fundamentals.",
			},
		},
		{
			title: "Full Stack Open — React",
			content:
				"University of Helsinki course: React, Redux, Node.js, MongoDB, GraphQL, and TypeScript in one course.",
			metadata: {
				url: "https://fullstackopen.com",
				platform: "University of Helsinki",
				type: "course",
				difficulty: "intermediate",
				skill: "React",
				reason:
					"Comprehensive free university course covering React and full-stack development.",
			},
		},
		{
			title: "Epic React — Free Preview",
			content:
				"Kent C. Dodds' React course: fundamentals, hooks, advanced patterns, performance, and testing.",
			metadata: {
				url: "https://epicreact.dev",
				platform: "Epic React",
				type: "course",
				difficulty: "intermediate",
				skill: "React",
				reason:
					"Industry-leading React course by Kent C. Dodds covering patterns used in production apps.",
			},
		},
		{
			title: "Build a Trello Clone with React",
			content:
				"Build a full Trello clone using React, TypeScript, react-beautiful-dnd, and styled-components.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+trello+clone+react+typescript",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "React",
				reason:
					"Portfolio project: drag-and-drop Kanban board with React and TypeScript.",
			},
		},

		// --- Next.js ---
		{
			title: "Next.js Documentation & Tutorial",
			content:
				"Official Next.js docs: App Router, server components, data fetching, caching, and deployment.",
			metadata: {
				url: "https://nextjs.org/docs",
				platform: "nextjs.org",
				type: "documentation",
				difficulty: "beginner",
				skill: "Next.js",
				reason:
					"Official Next.js documentation with interactive examples and deployment guides.",
			},
		},
		{
			title: "Next.js Learn — Free Course",
			content:
				"Free interactive Next.js course from Vercel: from basics to production deployment with database.",
			metadata: {
				url: "https://nextjs.org/learn",
				platform: "nextjs.org",
				type: "course",
				difficulty: "beginner",
				skill: "Next.js",
				reason:
					"Official free Next.js course covering App Router, auth, databases, and deployment.",
			},
		},
		{
			title: "Build a SaaS with Next.js",
			content:
				"Build a full SaaS application with Next.js 14, Stripe, Prisma, PostgreSQL, and authentication.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+saas+nextjs+full+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "advanced",
				skill: "Next.js",
				reason:
					"Full-stack SaaS project with payments, auth, and database integration.",
			},
		},

		// --- CSS ---
		{
			title: "CSS-Tricks Complete Guide to Grid",
			content:
				"Complete visual guide to CSS Grid with interactive examples, browser support, and layout patterns.",
			metadata: {
				url: "https://css-tricks.com/snippets/css/complete-guide-grid",
				platform: "CSS-Tricks",
				type: "tutorial",
				difficulty: "beginner",
				skill: "CSS",
				reason:
					"The definitive visual guide to CSS Grid with examples and cross-browser compatibility.",
			},
		},
		{
			title: "CSS-Tricks Flexbox Guide",
			content:
				"Complete guide to Flexbox with visual examples, property reference, and common layout patterns.",
			metadata: {
				url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox",
				platform: "CSS-Tricks",
				type: "tutorial",
				difficulty: "beginner",
				skill: "CSS",
				reason:
					"Visual guide to Flexbox with interactive demos and real-world layout patterns.",
			},
		},
		{
			title: "FreeCodeCamp Responsive Web Design",
			content:
				"Learn HTML and CSS by building 15 projects: forms, landing pages, portfolios, and documentation.",
			metadata: {
				url: "https://freecodecamp.org/learn/responsive-web-design",
				platform: "freeCodeCamp",
				type: "course",
				difficulty: "beginner",
				skill: "CSS",
				reason:
					"Free responsive web design certification with hands-on HTML and CSS projects.",
			},
		},
		{
			title: "Build 10 CSS Projects",
			content:
				"Build 10 real-world CSS projects: glassmorphism, neumorphism, animated buttons, cards, and dashboards.",
			metadata: {
				url: "https://youtube.com/results?search_query=10+css+projects+for+portfolio",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "CSS",
				reason:
					"Portfolio-ready CSS projects demonstrating modern styling techniques and animations.",
			},
		},
		{
			title: "Tailwind CSS Documentation",
			content:
				"Utility-first CSS framework docs with examples for rapid UI development and responsive design.",
			metadata: {
				url: "https://tailwindcss.com/docs",
				platform: "tailwindcss.com",
				type: "documentation",
				difficulty: "beginner",
				skill: "CSS",
				reason:
					"Official Tailwind CSS documentation with interactive playground and component examples.",
			},
		},

		// --- Node.js ---
		{
			title: "Node.js Official Documentation",
			content:
				"Official Node.js docs covering file system, HTTP, streams, buffers, child processes, and crypto.",
			metadata: {
				url: "https://nodejs.org/docs/latest/api",
				platform: "nodejs.org",
				type: "documentation",
				difficulty: "beginner",
				skill: "Node.js",
				reason:
					"Official Node.js API documentation with guides and code examples for every module.",
			},
		},
		{
			title: "Node.js Design Patterns Book",
			content:
				"Learn Node.js design patterns: modules, observer, factory, middleware, and async control flow.",
			metadata: {
				url: "https://nodejsdesignpatterns.com",
				platform: "Node.js Design Patterns",
				type: "book",
				difficulty: "advanced",
				skill: "Node.js",
				reason:
					"Comprehensive guide to Node.js design patterns, best practices, and production techniques.",
			},
		},
		{
			title: "Build a REST API with Node.js",
			content:
				"Step-by-step guide to building a production-ready REST API with Express, validation, and auth.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+rest+api+nodejs+express+crash+course",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Node.js",
				reason:
					"Build a complete REST API with Express, JWT auth, and database integration.",
			},
		},
		{
			title: "Build a Real-time Chat App with Node.js",
			content:
				"Build a real-time chat application with Node.js, Socket.io, Express, and MongoDB.",
			metadata: {
				url: "https://youtube.com/results?search_query=nodejs+socketio+realtime+chat+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Node.js",
				reason:
					"Portfolio project: real-time communication with WebSockets and Node.js.",
			},
		},

		// --- Python ---
		{
			title: "Python Official Tutorial",
			content:
				"Official Python tutorial covering data structures, modules, I/O, errors, classes, and standard library.",
			metadata: {
				url: "https://docs.python.org/3/tutorial",
				platform: "python.org",
				type: "documentation",
				difficulty: "beginner",
				skill: "Python",
				reason:
					"The official Python tutorial by the creators — the most authoritative free resource.",
			},
		},
		{
			title: "Automate the Boring Stuff with Python",
			content:
				"Free book teaching Python through practical automation: web scraping, Excel, PDFs, email, and more.",
			metadata: {
				url: "https://automatetheboringstuff.com",
				platform: "automatetheboringstuff.com",
				type: "book",
				difficulty: "beginner",
				skill: "Python",
				reason:
					"The most popular free Python book focused on practical automation projects.",
			},
		},
		{
			title: "FreeCodeCamp Python Course",
			content:
				"Learn Python from scratch: data types, functions, OOP, file handling, and 10+ hands-on projects.",
			metadata: {
				url: "https://youtube.com/watch?v=rfscVS0vtbw",
				platform: "YouTube",
				type: "course",
				difficulty: "beginner",
				skill: "Python",
				reason:
					"4-hour free Python course with 10+ projects including games and web scrapers.",
			},
		},
		{
			title: "Build a Web Scraper with Python",
			content:
				"Build a production web scraper using Python, BeautifulSoup, Selenium, and Scrapy.",
			metadata: {
				url: "https://youtube.com/results?search_query=python+web+scraper+project+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Python",
				reason:
					"Hands-on web scraping project with real websites and data extraction techniques.",
			},
		},
		{
			title: "Real Python Tutorials",
			content:
				"Thousands of free Python tutorials covering web dev, data science, automation, and best practices.",
			metadata: {
				url: "https://realpython.com",
				platform: "Real Python",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Python",
				reason:
					"High-quality Python tutorials with code examples covering web, data, and automation.",
			},
		},

		// --- SQL / PostgreSQL ---
		{
			title: "PostgreSQL Tutorial",
			content:
				"Complete PostgreSQL tutorial covering queries, joins, indexes, transactions, and performance tuning.",
			metadata: {
				url: "https://postgresqltutorial.com",
				platform: "postgresqltutorial.com",
				type: "tutorial",
				difficulty: "beginner",
				skill: "PostgreSQL",
				reason:
					"Free PostgreSQL tutorial with practical examples from basic queries to advanced optimization.",
			},
		},
		{
			title: "SQL for Data Analysis (Mode Analytics)",
			content:
				"Interactive SQL tutorial: SELECT, JOINs, window functions, CTEs, and analytics queries.",
			metadata: {
				url: "https://mode.com/sql-tutorial",
				platform: "Mode Analytics",
				type: "tutorial",
				difficulty: "beginner",
				skill: "SQL",
				reason:
					"Interactive SQL tutorial with real data and analytics-focused exercises.",
			},
		},
		{
			title: "Use The Index, Luke",
			content:
				"Free book about SQL indexing: B-tree, bitmap, partial indexes, query optimization, and EXPLAIN.",
			metadata: {
				url: "https://use-the-index-luke.com",
				platform: "Use The Index, Luke",
				type: "book",
				difficulty: "advanced",
				skill: "SQL",
				reason:
					"The definitive free guide to SQL indexing and query performance optimization.",
			},
		},
		{
			title: "SQLZoo — Interactive SQL Tutorial",
			content:
				"Learn SQL interactively with real databases: SELECT, JOIN, aggregation, subqueries, and DML.",
			metadata: {
				url: "https://sqlzoo.net",
				platform: "SQLZoo",
				type: "tutorial",
				difficulty: "beginner",
				skill: "SQL",
				reason:
					"Interactive SQL tutorial with live database exercises and progressive difficulty.",
			},
		},
		{
			title: "Design an E-commerce Database",
			content:
				"Design and implement a full e-commerce database schema with PostgreSQL from scratch.",
			metadata: {
				url: "https://youtube.com/results?search_query=design+ecommerce+database+postgresql+schema",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "PostgreSQL",
				reason:
					"Real-world database design project with normalization, indexes, and complex queries.",
			},
		},

		// --- Docker ---
		{
			title: "Docker Official Getting Started Guide",
			content:
				"Official Docker tutorial: containers, images, Dockerfile, volumes, networks, and Docker Compose.",
			metadata: {
				url: "https://docs.docker.com/get-started",
				platform: "docker.com",
				type: "documentation",
				difficulty: "beginner",
				skill: "Docker",
				reason:
					"Official Docker getting-started guide with hands-on examples and best practices.",
			},
		},
		{
			title: "Docker for Beginners (Play with Docker)",
			content:
				"Free interactive Docker playground with tutorials: containers, images, compose, and swarm.",
			metadata: {
				url: "https://dockerlabs.collabnix.com",
				platform: "Docker Labs",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Docker",
				reason:
					"Free Docker labs with interactive exercises and real environment to practice.",
			},
		},
		{
			title: "Dockerize a Full-Stack App",
			content:
				"Containerize a complete Node.js + React application with Docker Compose for development and production.",
			metadata: {
				url: "https://youtube.com/results?search_query=dockerize+fullstack+app+node+react+compose",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Docker",
				reason:
					"Real-world Docker Compose project with multi-service orchestration.",
			},
		},

		// --- AWS ---
		{
			title: "AWS Free Tier & Getting Started",
			content:
				"Free AWS tutorials: EC2, S3, Lambda, RDS, IAM, VPC with free tier eligible hands-on labs.",
			metadata: {
				url: "https://aws.amazon.com/free",
				platform: "AWS",
				type: "tutorial",
				difficulty: "beginner",
				skill: "AWS",
				reason:
					"AWS free tier with hands-on labs and tutorials for core services at no cost.",
			},
		},
		{
			title: "AWS Hands-On Tutorials",
			content:
				"100+ free AWS tutorials: deploy web apps, set up databases, create serverless APIs, and configure CI/CD.",
			metadata: {
				url: "https://aws.amazon.com/getting-started/hands-on",
				platform: "AWS",
				type: "tutorial",
				difficulty: "beginner",
				skill: "AWS",
				reason:
					"Official AWS hands-on tutorials with step-by-step instructions and free tier usage.",
			},
		},
		{
			title: "Deploy a Web App on AWS EC2",
			content:
				"Launch and configure EC2, set up security groups, deploy a Node.js web app, and configure a domain.",
			metadata: {
				url: "https://youtube.com/results?search_query=deploy+nodejs+app+aws+ec2+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "AWS",
				reason:
					"Practical EC2 deployment project covering security, load balancing, and domain setup.",
			},
		},

		// --- Git ---
		{
			title: "Pro Git Book",
			content:
				"Free comprehensive Git book covering branching, merging, rebasing, remotes, internals, and workflows.",
			metadata: {
				url: "https://git-scm.com/book",
				platform: "git-scm.com",
				type: "book",
				difficulty: "beginner",
				skill: "Git",
				reason:
					"The official Pro Git book — the most comprehensive free resource on Git.",
			},
		},
		{
			title: "Learn Git Branching",
			content:
				"Interactive Git branching game: master commits, branches, merge, rebase, and conflict resolution.",
			metadata: {
				url: "https://learngitbranching.js.org",
				platform: "Learn Git Branching",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Git",
				reason:
					"Interactive visual Git tutorial that makes branching and merging concepts click.",
			},
		},
		{
			title: "GitHub Skills",
			content:
				"Free interactive courses by GitHub: GitHub Flow, CI/CD, Actions, Pages, and collaboration.",
			metadata: {
				url: "https://skills.github.com",
				platform: "GitHub",
				type: "course",
				difficulty: "beginner",
				skill: "Git",
				reason:
					"Official GitHub Skills courses with interactive exercises and real repository practice.",
			},
		},

		// --- System Design ---
		{
			title: "System Design Primer",
			content:
				"Comprehensive system design resource: scalability, load balancing, caching, CDN, databases, and case studies.",
			metadata: {
				url: "https://github.com/donnemartin/system-design-primer",
				platform: "GitHub",
				type: "book",
				difficulty: "intermediate",
				skill: "System Design",
				reason:
					"The most popular free system design resource with case studies from top tech companies.",
			},
		},
		{
			title: "System Design Interview (freecodecamp)",
			content:
				"Learn system design concepts: URL shortener, chat system, design Netflix, Uber, and Twitter.",
			metadata: {
				url: "https://youtube.com/watch?v=UzLhG3QvB6A",
				platform: "YouTube",
				type: "course",
				difficulty: "intermediate",
				skill: "System Design",
				reason:
					"Free 1-hour system design interview prep covering 5 real-world architectures.",
			},
		},
		{
			title: "Design a URL Shortener",
			content:
				"Full system design walkthrough: rate limiting, database sharding, cache, and analytics for URL shortener.",
			metadata: {
				url: "https://youtube.com/results?search_query=design+url+shortener+system+design+interview",
				platform: "YouTube",
				type: "video",
				difficulty: "intermediate",
				skill: "System Design",
				reason: "Whiteboard walkthrough of designing a scalable URL shortener.",
			},
		},
		{
			title: "Design WhatsApp / Messenger",
			content:
				"Architecture deep dive: real-time messaging, WebSockets, message queues, and data partitioning.",
			metadata: {
				url: "https://youtube.com/results?search_query=design+whatsapp+system+design+interview",
				platform: "YouTube",
				type: "project",
				difficulty: "advanced",
				skill: "System Design",
				reason:
					"Design a scalable messaging system handling millions of concurrent connections.",
			},
		},

		// --- Data Structures & Algorithms ---
		{
			title: "FreeCodeCamp DSA Course",
			content:
				"Learn data structures and algorithms with 100+ coding challenges: arrays, trees, graphs, DP.",
			metadata: {
				url: "https://youtube.com/watch?v=8hly31xKli0",
				platform: "YouTube",
				type: "course",
				difficulty: "beginner",
				skill: "Data Structures",
				reason:
					"Free 8-hour DSA course with visual explanations and coding exercises.",
			},
		},
		{
			title: "LeetCode Explore — Data Structures",
			content:
				"Interactive data structure tutorials on LeetCode: arrays, linked lists, trees, graphs, and hash tables.",
			metadata: {
				url: "https://leetcode.com/explore/learn",
				platform: "LeetCode",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Data Structures",
				reason:
					"Learn data structures interactively with practice problems on LeetCode.",
			},
		},
		{
			title: "Visualgo — Algorithm Visualizations",
			content:
				"Interactive visualizations of data structures and algorithms: sorting, BST, graph, DP, and more.",
			metadata: {
				url: "https://visualgo.net",
				platform: "Visualgo",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Algorithms",
				reason:
					"See algorithms in action with step-by-step visualizations and animations.",
			},
		},
		{
			title: "NeetCode DSA Roadmap",
			content:
				"Structured DSA roadmap with 150+ LeetCode problems grouped by pattern: two pointers, sliding window, DP.",
			metadata: {
				url: "https://neetcode.io/roadmap",
				platform: "NeetCode",
				type: "course",
				difficulty: "intermediate",
				skill: "Algorithms",
				reason:
					"Free structured DSA roadmap with video solutions and pattern-based learning.",
			},
		},
		{
			title: "Solve 50 DSA Problems on LeetCode",
			content:
				"Curated list of 50 must-solve DSA problems for product company interviews with video solutions.",
			metadata: {
				url: "https://leetcode.com/problem-list/top-interview-questions",
				platform: "LeetCode",
				type: "project",
				difficulty: "intermediate",
				skill: "Algorithms",
				reason:
					"Practice with the most common interview questions from FAANG companies.",
			},
		},

		// --- Testing ---
		{
			title: "Jest Documentation",
			content:
				"Official Jest docs: matchers, mocks, async testing, snapshot testing, and configuration.",
			metadata: {
				url: "https://jestjs.io/docs",
				platform: "jestjs.io",
				type: "documentation",
				difficulty: "beginner",
				skill: "Testing",
				reason:
					"Official Jest documentation with examples for unit and integration testing.",
			},
		},
		{
			title: "Testing Library Docs",
			content:
				"React Testing Library, DOM Testing Library: queries, fireEvent, waitFor, and best practices.",
			metadata: {
				url: "https://testing-library.com/docs",
				platform: "testing-library.com",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Testing",
				reason:
					"Official Testing Library documentation for component testing best practices.",
			},
		},
		{
			title: "FreeCodeCamp Testing Course",
			content:
				"Learn test-driven development: unit tests, integration tests, mocks, and CI/CD testing pipelines.",
			metadata: {
				url: "https://youtube.com/results?search_query=testing+full+course+unit+integration+tdd",
				platform: "YouTube",
				type: "course",
				difficulty: "beginner",
				skill: "Testing",
				reason:
					"Free comprehensive testing course covering TDD, mocks, and CI/CD integration.",
			},
		},

		// --- Docker (additional) ---
		{
			title: "Kubernetes Official Tutorials",
			content:
				"Official Kubernetes tutorials: pods, deployments, services, ingress, ConfigMaps, and Helm charts.",
			metadata: {
				url: "https://kubernetes.io/docs/tutorials",
				platform: "kubernetes.io",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Kubernetes",
				reason:
					"Official K8s tutorials with interactive modules and hands-on exercises.",
			},
		},
		{
			title: "Kubernetes the Hard Way",
			content:
				"Bootstrap a Kubernetes cluster from scratch: TLS certs, controllers, networking, and kubeconfig.",
			metadata: {
				url: "https://github.com/kelseyhightower/kubernetes-the-hard-way",
				platform: "GitHub",
				type: "tutorial",
				difficulty: "advanced",
				skill: "Kubernetes",
				reason:
					"The definitive hands-on guide to understanding Kubernetes internals by building from scratch.",
			},
		},
		{
			title: "Deploy a Microservice on K8s",
			content:
				"Deploy a microservice-based application on Kubernetes with Helm, monitoring, and auto-scaling.",
			metadata: {
				url: "https://youtube.com/results?search_query=deploy+microservice+kubernetes+helm+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "advanced",
				skill: "Kubernetes",
				reason:
					"Real-world K8s project: microservices deployment with Helm and Prometheus monitoring.",
			},
		},

		// --- DevOps / CI/CD ---
		{
			title: "GitHub Actions Documentation",
			content:
				"Official GitHub Actions docs: workflows, events, runners, environments, and reusable workflows.",
			metadata: {
				url: "https://docs.github.com/en/actions",
				platform: "GitHub Docs",
				type: "documentation",
				difficulty: "beginner",
				skill: "CI/CD",
				reason:
					"Official GitHub Actions documentation for building automated CI/CD pipelines.",
			},
		},
		{
			title: "Build a CI/CD Pipeline for Node.js",
			content:
				"Set up complete CI/CD pipeline with GitHub Actions: lint, test, build, and deploy to AWS.",
			metadata: {
				url: "https://youtube.com/results?search_query=ci+cd+pipeline+github+actions+nodejs",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "CI/CD",
				reason:
					"Build a production CI/CD pipeline with automated testing and deployment.",
			},
		},
		{
			title: "Terraform Official Tutorials",
			content:
				"Learn Terraform: HCL, state management, modules, workspaces, and multi-cloud infrastructure.",
			metadata: {
				url: "https://developer.hashicorp.com/terraform/tutorials",
				platform: "HashiCorp",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Terraform",
				reason:
					"Official Terraform tutorials with hands-on labs for IaC and cloud provisioning.",
			},
		},
		{
			title: "Ansible Documentation",
			content:
				"Official Ansible docs: playbooks, roles, inventories, modules, and automation best practices.",
			metadata: {
				url: "https://docs.ansible.com",
				platform: "ansible.com",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Ansible",
				reason:
					"Official Ansible documentation for configuration management and automation.",
			},
		},

		// --- Machine Learning / AI ---
		{
			title: "Machine Learning by Andrew Ng (Coursera)",
			content:
				"Stanford ML course: regression, neural networks, SVMs, clustering, anomaly detection, and best practices.",
			metadata: {
				url: "https://coursera.org/learn/machine-learning",
				platform: "Coursera",
				type: "course",
				difficulty: "intermediate",
				skill: "Machine Learning",
				reason:
					"The most popular ML course by Andrew Ng — free to audit with all video lectures.",
			},
		},
		{
			title: "Fast.ai Practical Deep Learning",
			content:
				"Top-down practical deep learning: train models for vision, NLP, tabular data, and recommendation.",
			metadata: {
				url: "https://course.fast.ai",
				platform: "fast.ai",
				type: "course",
				difficulty: "intermediate",
				skill: "Deep Learning",
				reason:
					"Free practical deep learning course that teaches cutting-edge techniques from day one.",
			},
		},
		{
			title: "Scikit-learn User Guide",
			content:
				"Official scikit-learn guide: classification, regression, clustering, dimensionality reduction, and model selection.",
			metadata: {
				url: "https://scikit-learn.org/stable/user_guide",
				platform: "scikit-learn.org",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Machine Learning",
				reason:
					"Official scikit-learn documentation with examples for every ML algorithm.",
			},
		},
		{
			title: "PyTorch Tutorials",
			content:
				"Official PyTorch tutorials: tensors, autograd, neural networks, transfer learning, and deployment.",
			metadata: {
				url: "https://pytorch.org/tutorials",
				platform: "pytorch.org",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Machine Learning",
				reason:
					"Official PyTorch tutorials covering everything from tensors to model deployment.",
			},
		},
		{
			title: "Hugging Face NLP Course",
			content:
				"Learn NLP with transformers: BERT, GPT, T5, fine-tuning, tokenizers, and model deployment.",
			metadata: {
				url: "https://huggingface.co/learn/nlp-course",
				platform: "Hugging Face",
				type: "course",
				difficulty: "intermediate",
				skill: "Machine Learning",
				reason:
					"Free NLP course using Hugging Face transformers with real-world datasets.",
			},
		},
		{
			title: "Kaggle ML Competitions",
			content:
				"Practice ML on real datasets: classification, regression, computer vision, and NLP competitions.",
			metadata: {
				url: "https://kaggle.com/competitions",
				platform: "Kaggle",
				type: "project",
				difficulty: "intermediate",
				skill: "Machine Learning",
				reason:
					"Learn ML by competing on real-world problems with community notebooks and solutions.",
			},
		},
		{
			title: "MLOps Course (Made With ML)",
			content:
				"End-to-end MLOps: data pipelines, model training, deployment, monitoring, and CI/CD for ML.",
			metadata: {
				url: "https://madewithml.com",
				platform: "Made With ML",
				type: "course",
				difficulty: "advanced",
				skill: "Machine Learning",
				reason:
					"Free MLOps course covering the full ML lifecycle from data to production.",
			},
		},

		// --- Redis ---
		{
			title: "Redis Documentation",
			content:
				"Official Redis docs: data structures, commands, transactions, pub/sub, persistence, and clustering.",
			metadata: {
				url: "https://redis.io/docs",
				platform: "redis.io",
				type: "documentation",
				difficulty: "beginner",
				skill: "Redis",
				reason:
					"Official Redis documentation covering all commands, data structures, and best practices.",
			},
		},
		{
			title: "Redis University — Free Courses",
			content:
				"Free Redis courses: fundamentals, data structures, streams, geospatial, and search capabilities.",
			metadata: {
				url: "https://university.redis.com",
				platform: "Redis University",
				type: "course",
				difficulty: "beginner",
				skill: "Redis",
				reason:
					"Free Redis courses with hands-on labs and certification from Redis Labs.",
			},
		},

		// --- MongoDB ---
		{
			title: "MongoDB University",
			content:
				"Free MongoDB courses: CRUD, aggregation, indexing, Atlas, and data modeling with hands-on labs.",
			metadata: {
				url: "https://learn.mongodb.com",
				platform: "MongoDB University",
				type: "course",
				difficulty: "beginner",
				skill: "MongoDB",
				reason:
					"Free MongoDB courses from the creators with certification paths and labs.",
			},
		},
		{
			title: "MongoDB Documentation",
			content:
				"Official MongoDB docs: queries, aggregation pipeline, indexing, replica sets, and sharding.",
			metadata: {
				url: "https://mongodb.com/docs",
				platform: "mongodb.com",
				type: "documentation",
				difficulty: "beginner",
				skill: "MongoDB",
				reason:
					"Official MongoDB documentation with comprehensive guides and API references.",
			},
		},

		// --- OOP / Design Patterns ---
		{
			title: "Refactoring Guru — Design Patterns",
			content:
				"Catalog of 22 Gang of Four design patterns with UML diagrams, code examples, and real-world use cases.",
			metadata: {
				url: "https://refactoring.guru/design-patterns",
				platform: "Refactoring Guru",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Object-Oriented Programming",
				reason:
					"The best free design patterns resource with visual explanations and code examples.",
			},
		},
		{
			title: "SOLID Principles Explained",
			content:
				"Learn SOLID principles with practical examples: SRP, OCP, LSP, ISP, DIP in TypeScript and Python.",
			metadata: {
				url: "https://youtube.com/results?search_query=solid+principles+explained+with+examples",
				platform: "YouTube",
				type: "video",
				difficulty: "intermediate",
				skill: "Object-Oriented Programming",
				reason:
					"Clear explanations of SOLID principles with real-world code examples.",
			},
		},

		// --- REST & API Design ---
		{
			title: "REST API Best Practices (Stack Overflow)",
			content:
				"REST API design best practices: resource naming, status codes, versioning, pagination, and HATEOAS.",
			metadata: {
				url: "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design",
				platform: "Stack Overflow Blog",
				type: "article",
				difficulty: "intermediate",
				skill: "REST APIs",
				reason:
					"Industry best practices for REST API design from the Stack Overflow team.",
			},
		},
		{
			title: "Build a REST API with Auth0",
			content:
				"Build a secure REST API with JWT authentication, role-based access, rate limiting, and Swagger docs.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+secure+rest+api+jwt+auth+nodejs",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "REST APIs",
				reason:
					"Production-ready REST API with authentication, authorization, and API documentation.",
			},
		},
		{
			title: "OpenAPI Specification Guide",
			content:
				"Learn OpenAPI 3.0: design-first API development with Swagger, code generation, and documentation.",
			metadata: {
				url: "https://swagger.io/docs/specification/about",
				platform: "Swagger",
				type: "documentation",
				difficulty: "intermediate",
				skill: "REST APIs",
				reason:
					"Official OpenAPI specification guide for API design-first development.",
			},
		},

		// --- GraphQL ---
		{
			title: "GraphQL Official Learn Section",
			content:
				"Official GraphQL tutorial: queries, mutations, subscriptions, schemas, resolvers, and best practices.",
			metadata: {
				url: "https://graphql.org/learn",
				platform: "graphql.org",
				type: "documentation",
				difficulty: "beginner",
				skill: "GraphQL",
				reason:
					"Official GraphQL documentation with interactive examples and schema design guides.",
			},
		},
		{
			title: "Build a GraphQL API for a Blog",
			content:
				"Build a complete GraphQL API with Apollo Server, data loaders, authentication, and subscriptions.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+graphql+api+apollo+server+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "GraphQL",
				reason:
					"Build a real GraphQL API with batching, caching, and real-time subscriptions.",
			},
		},
		{
			title: "How to GraphQL — Free Tutorial",
			content:
				"Free full-stack GraphQL tutorial: schema design, resolvers, Apollo Client, and React integration.",
			metadata: {
				url: "https://howtographql.com",
				platform: "How to GraphQL",
				type: "tutorial",
				difficulty: "beginner",
				skill: "GraphQL",
				reason:
					"Free GraphQL tutorial with both frontend and backend tracks and real examples.",
			},
		},

		// --- Cybersecurity ---
		{
			title: "TryHackMe — Free Cybersecurity Labs",
			content:
				"Interactive cybersecurity training: network scanning, web exploitation, cryptography, and privilege escalation.",
			metadata: {
				url: "https://tryhackme.com",
				platform: "TryHackMe",
				type: "course",
				difficulty: "beginner",
				skill: "Network Security",
				reason:
					"Free interactive cybersecurity labs with real-world scenarios and gamified learning.",
			},
		},
		{
			title: "OWASP Top 10 Web Security",
			content:
				"Learn the most critical web application security risks: SQL injection, XSS, CSRF, and authentication flaws.",
			metadata: {
				url: "https://owasp.org/www-project-top-ten",
				platform: "OWASP",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Network Security",
				reason:
					"The industry standard for web security — free guide from OWASP foundation.",
			},
		},
		{
			title: "Hack the Box — Free Machines",
			content:
				"Free penetration testing challenges: exploit vulnerabilities, escalate privileges, and capture flags.",
			metadata: {
				url: "https://hackthebox.com",
				platform: "Hack The Box",
				type: "project",
				difficulty: "intermediate",
				skill: "Network Security",
				reason:
					"Practice penetration testing on real vulnerable machines and network scenarios.",
			},
		},

		// --- Data / Analytics ---
		{
			title: "Pandas Documentation",
			content:
				"Official Pandas docs: data structures, I/O, merging, reshaping, groupby, and time series analysis.",
			metadata: {
				url: "https://pandas.pydata.org/docs",
				platform: "pandas.pydata.org",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Python",
				reason:
					"Official Pandas documentation for data manipulation and analysis.",
			},
		},
		{
			title: "Spark — Learn Apache Spark",
			content:
				"Free Apache Spark course: RDDs, DataFrames, SQL, streaming, MLlib, and GraphX.",
			metadata: {
				url: "https://spark.apache.org/docs/latest",
				platform: "Apache Spark",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Apache Spark",
				reason:
					"Official Apache Spark documentation with quick-start guide and programming examples.",
			},
		},
		{
			title: "dbt Learn — Analytics Engineering",
			content:
				"Free dbt course: data modeling, transformations, testing, documentation, and CI/CD for analytics.",
			metadata: {
				url: "https://docs.getdbt.com/learn",
				platform: "dbt",
				type: "course",
				difficulty: "intermediate",
				skill: "Apache Spark",
				reason:
					"Free dbt course for analytics engineering with hands-on projects and best practices.",
			},
		},
		{
			title: "Tableau Public — Free Training",
			content:
				"Free Tableau training: data visualization, dashboards, calculations, maps, and storytelling.",
			metadata: {
				url: "https://tableau.com/learn/training",
				platform: "Tableau",
				type: "course",
				difficulty: "beginner",
				skill: "Apache Spark",
				reason:
					"Free Tableau training resources with video tutorials and practice datasets.",
			},
		},

		// --- Go ---
		{
			title: "Go by Example",
			content:
				"Learn Go through annotated example programs: goroutines, channels, interfaces, testing, and HTTP servers.",
			metadata: {
				url: "https://gobyexample.com",
				platform: "Go by Example",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Go",
				reason:
					"The best free Go tutorial with runnable examples for every language feature.",
			},
		},
		{
			title: "Effective Go",
			content:
				"Official Go best practices guide: formatting, naming, control structures, concurrency, and error handling.",
			metadata: {
				url: "https://go.dev/doc/effective_go",
				platform: "go.dev",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Go",
				reason:
					"Official Go style guide and best practices from the Go team at Google.",
			},
		},
		{
			title: "Build a REST API in Go",
			content:
				"Build a production REST API in Go with chi router, PostgreSQL, JWT auth, and testing.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+rest+api+golang+chi+postgresql",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Go",
				reason:
					"Hands-on Go API project with routing, database, authentication, and tests.",
			},
		},

		// --- Java ---
		{
			title: "Java Tutorial (Oracle)",
			content:
				"Official Java tutorial from Oracle: basics, collections, I/O, networking, concurrency, and GUI.",
			metadata: {
				url: "https://docs.oracle.com/javase/tutorial",
				platform: "Oracle",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Java",
				reason:
					"Official Java tutorials from Oracle covering core language and standard library.",
			},
		},
		{
			title: "Spring Boot Quick Start Guide",
			content:
				"Official Spring Boot guide: dependency injection, REST APIs, data access, security, and testing.",
			metadata: {
				url: "https://spring.io/quickstart",
				platform: "spring.io",
				type: "documentation",
				difficulty: "intermediate",
				skill: "Java",
				reason:
					"Official Spring Boot quick start guide for building production Java microservices.",
			},
		},
		{
			title: "Build a CRUD App with Spring Boot",
			content:
				"Build a complete CRUD REST API with Spring Boot, JPA, Hibernate, PostgreSQL, and Swagger.",
			metadata: {
				url: "https://youtube.com/results?search_query=spring+boot+crud+rest+api+tutorial",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "Java",
				reason:
					"Full-stack Java project: REST API with Spring Boot, JPA, and database integration.",
			},
		},

		// --- C++ ---
		{
			title: "LearnCpp.com",
			content:
				"Free C++ tutorial covering everything: pointers, references, OOP, STL, memory management, and C++20.",
			metadata: {
				url: "https://learncpp.com",
				platform: "LearnCpp",
				type: "tutorial",
				difficulty: "beginner",
				skill: "C++",
				reason:
					"The most comprehensive free C++ tutorial with clear explanations and code examples.",
			},
		},
		{
			title: "C++ Reference (cppreference.com)",
			content:
				"Complete C++ language and STL reference with documentation, examples, and compiler support tables.",
			metadata: {
				url: "https://en.cppreference.com",
				platform: "cppreference.com",
				type: "documentation",
				difficulty: "intermediate",
				skill: "C++",
				reason:
					"The definitive C++ language reference with examples and standards compliance.",
			},
		},
		{
			title: "Build a System Monitor in C++",
			content:
				"Build a real-time system monitoring tool in C++ using system APIs, multithreading, and GUI.",
			metadata: {
				url: "https://youtube.com/results?search_query=build+system+monitor+c%2B%2B+project",
				platform: "YouTube",
				type: "project",
				difficulty: "intermediate",
				skill: "C++",
				reason:
					"Systems programming project in C++ with real-time data and visualization.",
			},
		},

		// --- C# ---
		{
			title: "Microsoft C# Tutorial",
			content:
				"Official Microsoft C# tutorial: types, OOP, LINQ, async/await, generics, and .NET fundamentals.",
			metadata: {
				url: "https://learn.microsoft.com/en-us/dotnet/csharp",
				platform: "Microsoft Learn",
				type: "tutorial",
				difficulty: "beginner",
				skill: "C#",
				reason:
					"Official Microsoft C# documentation with interactive tutorials and code samples.",
			},
		},
		{
			title: "C# Documentation (Microsoft)",
			content:
				"Official C# and .NET API reference: classes, structs, interfaces, delegates, and attributes.",
			metadata: {
				url: "https://learn.microsoft.com/en-us/dotnet/api",
				platform: "Microsoft Learn",
				type: "documentation",
				difficulty: "beginner",
				skill: "C#",
				reason: "Complete C# and .NET API reference with usage examples.",
			},
		},

		// --- Performance Optimization ---
		{
			title: "Web Performance (web.dev)",
			content:
				"Google's web performance guides: Core Web Vitals, lazy loading, code splitting, and caching strategies.",
			metadata: {
				url: "https://web.dev/learn-core-web-vitals",
				platform: "web.dev",
				type: "tutorial",
				difficulty: "intermediate",
				skill: "Performance Optimization",
				reason:
					"Google's official web performance guides with actionable metrics and optimization techniques.",
			},
		},
		{
			title: "Database Indexing Explained",
			content:
				"Deep dive into database indexing: B-trees, hash indexes, covering indexes, and query optimization.",
			metadata: {
				url: "https://youtube.com/results?search_query=database+indexing+explained+deep+dive",
				platform: "YouTube",
				type: "video",
				difficulty: "intermediate",
				skill: "Performance Optimization",
				reason:
					"Clear explanation of database indexing with visual examples and performance benchmarks.",
			},
		},

		// --- General Career / Soft Skills ---
		{
			title: "Roadmap.sh — Developer Roadmaps",
			content:
				"Community-driven roadmaps with learning paths and resources for every tech career path.",
			metadata: {
				url: "https://roadmap.sh",
				platform: "roadmap.sh",
				type: "guide",
				difficulty: "beginner",
				skill: "Career Planning",
				reason:
					"The best free developer roadmap resource with curated paths for every role.",
			},
		},
		{
			title: "The Odin Project",
			content:
				"Free full-stack curriculum with projects: Ruby, Rails, JavaScript, React, Node.js, and databases.",
			metadata: {
				url: "https://theodinproject.com",
				platform: "The Odin Project",
				type: "course",
				difficulty: "beginner",
				skill: "Full-Stack Development",
				reason:
					"Free full-stack curriculum with real projects and community support.",
			},
		},
		{
			title: "FreeCodeCamp",
			content:
				"Free interactive coding courses with certifications: responsive web, JS, frontend, backend, and ML.",
			metadata: {
				url: "https://freecodecamp.org",
				platform: "freeCodeCamp",
				type: "course",
				difficulty: "beginner",
				skill: "Full-Stack Development",
				reason:
					"Free 3000+ hour curriculum with industry-recognized certifications and hands-on projects.",
			},
		},
		{
			title: "Dev.to — Developer Community",
			content:
				"Community-driven articles and tutorials: web dev, DevOps, AI, mobile, and career discussions.",
			metadata: {
				url: "https://dev.to",
				platform: "Dev.to",
				type: "tutorial",
				difficulty: "beginner",
				skill: "Career Planning",
				reason:
					"Active developer community with thousands of free tutorials and industry insights.",
			},
		},
	];

	await prisma.vectorDocument.createMany({
		data: [
			...careerProfiles.map((p) => ({ source: "career_profile", ...p })),
			...learningResources.map((r) => ({ source: "learning_resource", ...r })),
			...jobPostings.map((j) => ({
				source: "job_posting",
				title: j.title,
				content: j.content,
				metadata: j.metadata as Prisma.InputJsonValue,
			})),
		],
	});

	await ingestCareerProfilesToVectorStore();
	await ingestLearningResourcesToVectorStore();

	for (const posting of jobPostings) {
		const embedding = await generateEmbedding(posting.content);
		if (!embedding) continue;
		await storeVectors(VECTOR_COLLECTIONS.JOB_REQUIREMENTS, [
			{
				id: `${posting.metadata.company}-${posting.title}`.replace(/\s+/g, "-").toLowerCase(),
				title: posting.title,
				content: posting.content,
				embedding,
				metadata: posting.metadata as Record<string, unknown>,
			},
		]);
	}

	console.log(`Seeded ${jobPostings.length} job postings into vector store.`);
}
