import type { Prisma } from "@prisma/client";
import { prisma } from "@/database";
import { persistResultsNode } from "@/features/ai-agents/services/persist-service";
import { resourceRecommendationNode } from "@/features/ai-agents/services/resource-service";
import { resolveAliases } from "@/utils/skill-matching";
import { callAI } from "@/services/ai-service";
import type { AgentState } from "@/features/ai-agents/types/agent.types";
import { getMarketProfile, mergeProfiles } from "@/services/job-market/market-profile-service";
import {
	extractSkillGapDetails,
	validateResumePdf,
} from "@/services/resume-service";
import type {
	AnalyzeSkillGapResponse,
	LatestSkillGapResponse,
	ResumeAnalysisResult,
	SkillGapAnalysisResult,
	WeightedSkill,
} from "../types/skill-gap.types";
import {
	categorizeSkillsForGoal,
	computeGapPriority,
	computeMatchScore,
	getCareerProfile,
	inferExperienceLevel,
	inferSkillsFromRepos,
} from "./career-goals-service";
import type { CareerGoalProfile, ExperienceLevel } from "./career-goals-service";

export function buildResumeAnalysisPrompt(careerGoal: string): string {
	const profile = getCareerProfile(careerGoal);
	return `You are an expert AI Resume Analyzer, ATS specialist, and technical recruiter with 10+ years of experience at top tech companies (Google, Meta, Amazon, etc.).

Analyze the uploaded resume for a candidate targeting: "${careerGoal}".

Key skills expected for this role:
- Core: ${profile.coreSkills.join(", ")}
- Tools/Platforms: ${profile.tools.join(", ")}

Perform a RIGOROUS analysis following industry standards:

**ATS & Keyword Analysis:**
- Check for exact keyword matches with job description
- Verify keyword density (should be 2-3% for key terms)
- Identify missing critical keywords
- Check for proper section headings (Experience, Education, Skills, Projects)
- Validate formatting (no tables, graphics, or complex layouts)

**Content Quality Assessment:**
- Look for quantifiable achievements (numbers, percentages, impact metrics)
- Check for action verbs and result-oriented language
- Verify experience depth (should show progression and responsibility)
- Assess education relevance and timing
- Evaluate technical skill specificity (not just "programming" but "React, Node.js")

**Scoring Criteria (STRICT):**
- resumeScore: 0-100 based on:
  * 30%: Keyword match with role requirements
  * 25%: Quantifiable achievements and impact
  * 20%: Experience relevance and progression
  * 15%: ATS formatting compliance
  * 10%: Education and certifications alignment
- careerFit.score: 0-100 based on skill overlap and experience match

**Strict Scoring Rules:**
- Below 50: Major gaps, unlikely to pass ATS
- 50-65: Basic qualification, needs significant improvement
- 66-75: Good candidate, needs refinement
- 76-85: Strong candidate, competitive
- 86-95: Excellent candidate, high interview potential
- 96-100: Exceptional, rare to achieve

Extract ALL technical skills, soft skills, experience, and education from the resume.
Evaluate resume quality, ATS compatibility, and fit for the target role.

Respond strictly with a JSON object in this format:
{
  "skills": ["Technical skill 1", ...],
  "softSkills": ["Communication", ...],
  "experience": [{"role": "Role Title", "company": "Company", "duration": "Jan 2023 - Present"}],
  "education": [{"degree": "Degree", "school": "School", "year": "2024"}],
  "summary": "2-3 sentence professional summary of the candidate",
  "resumeScore": 65,
  "strengths": ["Specific resume strength 1", ...],
  "improvements": ["Actionable resume improvement 1", ...],
  "atsTips": ["ATS optimization tip 1", ...],
  "careerFit": {
    "score": 58,
    "summary": "How well this resume aligns with ${careerGoal} and what stands out"
  }
}

Rules:
- resumeScore and careerFit.score must be integers 0-100
- Be STRICT in scoring - most resumes should score 50-75
- List at least 3 strengths, 3 improvements, and 3 atsTips
- Be specific to the actual resume content, not generic
- If resume lacks quantifiable achievements, score below 60
- If missing critical keywords, score below 55
- If poor formatting, score below 50
- Only score above 80 for exceptional resumes with strong metrics and perfect keyword match`;
}

export function buildSkillGapAnalysisPrompt(
	skills: string[],
	careerGoal: string,
	experience?: { role: string; company: string; duration: string }[],
	education?: { degree: string; school: string; year: string }[],
	marketContext?: { topCompanies?: string[]; marketDemandedSkills?: string[] },
): string {
	const profile = getCareerProfile(careerGoal);
	const marketNote = marketContext
		? `\n\nMarket Context (India 2026):\n- Top Hiring Companies: ${(marketContext.topCompanies || []).join(", ")}\n- Most In-Demand Skills for this Goal: ${(marketContext.marketDemandedSkills || []).join(", ")}`
		: "";
	const context = {
		skills,
		careerGoal,
		experience: experience || [],
		education: education || [],
		roleRequirements: {
			core: profile.coreSkills,
			tools: profile.tools,
			soft: profile.softSkills,
			certifications: profile.certifications,
		},
		marketData: marketContext || undefined,
	};

	return `You are an expert AI Skill Gap Analyzer and Career Coach.

Compare the candidate profile below against the target role "${careerGoal}".

Candidate Profile:
${JSON.stringify(context, null, 2)}

Perform a rigorous skill gap analysis. Categorize skills as strong (proficient/matches role), improving (partial exposure), or weak (missing/critical gap).${marketNote}

Respond strictly with a JSON object:
{
  "matchScore": 75,
  "strong": ["Skill1", ...],
  "improving": ["Skill2", ...],
  "weak": ["Skill3", ...],
  "priorityGaps": [
    {"skill": "Kubernetes", "importance": "high", "reason": "Core requirement for DevOps roles"}
  ],
  "skillCategories": {
    "core": {"matched": ["..."], "missing": ["..."]},
    "tools": {"matched": ["..."], "missing": ["..."]},
    "soft": {"matched": ["..."], "missing": ["..."]}
  },
  "roadmap": [
    {"step": "Phase title", "details": "Specific courses, projects, and practice", "duration": "2-3 weeks"}
  ],
  "coach": "Personalized 3-4 sentence coaching paragraph referencing their background",
  "timeToGoal": "${profile.typicalTimeline}",
  "recommendedCertifications": ["Cert 1", ...],
  "projectIdeas": ["Build X to demonstrate Y", ...],
  "assessment": [
    {"question": "Role-specific question?", "options": ["A", "B", "C", "D"], "answer": "Correct option"}
  ]
}

Rules:
- matchScore: integer 0-100 based on role fit
- priorityGaps: 4-6 items ranked by importance (high/medium/low)
- roadmap: 4-6 phased steps, ordered from foundations to advanced
- assessment: exactly 5 multiple-choice questions specific to ${careerGoal}
- Be specific to the candidate's actual skills and experience`;
}

export function buildMockResumeAnalysis(
	careerGoal: string,
): ResumeAnalysisResult {
	const profile = getCareerProfile(careerGoal);
	const commonSkills = resolveAliases(["Git", "Communication", "Problem Solving"]);
	const goalSkills = resolveAliases([
		...profile.coreSkills.slice(0, 3),
		...profile.tools.slice(0, 2),
	]);
	const baseSkills = [...new Set([...commonSkills, ...goalSkills])];
	const matched = profile.coreSkills.filter((s) =>
		baseSkills.some((b) =>
			b.toLowerCase() === s.toLowerCase(),
		),
	);

	return {
		skills: [...new Set([...baseSkills, ...matched.slice(0, 3)])],
		softSkills: ["Communication", "Problem Solving", "Team Collaboration"],
		experience: [
			{
				role: "Software Development Intern",
				company: "TechCorp",
				duration: "6 Months",
			},
			{
				role: "Student Developer",
				company: "University Lab",
				duration: "1 Year",
			},
		],
		education: [
			{
				degree: "B.S. Computer Science",
				school: "State University",
				year: "2025",
			},
		],
		summary:
			"Motivated computer science graduate with hands-on project experience in web development and programming fundamentals, seeking to grow into a professional engineering role.",
		resumeScore: 72,
		strengths: [
			"Clear project and internship experience",
			"Solid foundation in programming fundamentals",
			"Demonstrates continuous learning through personal projects",
		],
		improvements: [
			`Add quantifiable impact metrics (e.g., performance gains, users served)`,
			`Highlight ${profile.tools.slice(0, 2).join(" and ")} experience if applicable`,
			`Tailor summary to explicitly target ${careerGoal}`,
			"Include links to GitHub portfolio and live project demos",
		],
		atsTips: [
			"Use standard section headings: Experience, Education, Skills, Projects",
			`Include role keywords: ${profile.coreSkills.slice(0, 4).join(", ")}`,
			"Avoid graphics/tables that ATS parsers cannot read",
			"List skills in a dedicated section matching job description terminology",
		],
		careerFit: {
			score: Math.max(35, 55 + matched.length * 5),
			summary: `Your profile shows foundational engineering skills with room to grow into ${careerGoal}. Focus on ${profile.coreSkills.slice(0, 2).join(" and ")} to strengthen alignment.`,
		},
	};
}

export function buildMockSkillGap(
	skills: string[],
	careerGoal: string,
	experience?: { role: string; company: string; duration: string }[],
	_education?: { degree: string; school: string; year: string }[],
	experienceLevel?: ExperienceLevel,
	customWeights?: { weightedSkills: WeightedSkill[]; coreSkills: string[]; tools: string[] },
	repoSkills?: Set<string>,
	seniorityPostingSkills?: Set<string>,
): SkillGapAnalysisResult {
	const level = experienceLevel || inferExperienceLevel(experience);
	const { profile, strong, improving, weak, skillCategories, gapPriority } =
		categorizeSkillsForGoal(skills, careerGoal, level, customWeights, repoSkills, seniorityPostingSkills);

	const priorityGaps = weak.slice(0, 5).map((skill, i) => {
		const inMarket = seniorityPostingSkills?.has(skill);
		return {
			skill,
			importance: (inMarket
				? i < 2 ? "high" : "medium"
				: "low") as "high" | "medium" | "low",
			reason: inMarket
				? `Appears in ${level} job postings — market-critical for ${careerGoal}`
				: `Nice-to-have for ${careerGoal} — adds hiring advantage at ${level} level`,
		};
	});

	const { matchScore: weightedScore } = computeMatchScore(skills, careerGoal, level, customWeights?.weightedSkills);
	const matchScore = weightedScore;

	const expNote =
		experience && experience.length > 0
			? ` Your ${experience[0].role} experience is a good foundation.`
			: "";

	const roadmapsByGoal = getRoadmapsByGoal();

	const strongList = strong.length ? strong : [];
	const finalWeak = weak.length ? weak : profile.coreSkills.slice(0, 4);
	const finalPriorityGaps = finalWeak.slice(0, 5).map((skill, i) => {
		const inMarket = seniorityPostingSkills?.has(skill);
		return {
			skill,
			importance: (inMarket
				? i < 2 ? "high" : "medium"
				: "low") as "high" | "medium" | "low",
			reason: inMarket
				? `Appears in ${level} job postings — market-critical for ${careerGoal}`
				: `Nice-to-have for ${careerGoal} — adds hiring advantage at ${level} level`,
		};
	});
	const finalGapPriority = computeGapPriority(
		finalWeak,
		profile.weightedSkills,
		seniorityPostingSkills,
	);
	return {
		matchScore,
		strong: strongList,
		improving: improving.length ? improving : [],
		weak: finalWeak,
		gapPriority: finalGapPriority,
		priorityGaps: finalPriorityGaps,
		skillCategories,
		roadmap: roadmapsByGoal[careerGoal] || buildDefaultRoadmap(profile, careerGoal),
		coach: strongList.length > 0
			? `You're on a solid path toward ${careerGoal}.${expNote} Your strongest areas include ${strongList.slice(0, 3).join(", ")}. Prioritize closing gaps in ${weak.slice(0, 3).join(", ") || "role-specific tools"} through focused projects and structured learning over the next ${profile.typicalTimeline}.`
			: `You're building toward ${careerGoal}.${expNote} Focus on ${improving.slice(0, 3).join(", ") || profile.coreSkills.slice(0, 3).join(", ")} to strengthen your foundation. Prioritize closing gaps in ${weak.slice(0, 3).join(", ") || "role-specific tools"} through focused projects and structured learning over the next ${profile.typicalTimeline}.`,
		timeToGoal: profile.typicalTimeline,
		recommendedCertifications: profile.certifications.slice(0, 3),
		projectIdeas: [
			`Build a portfolio project showcasing ${profile.tools[0]} and ${profile.coreSkills[0]}`,
			`Contribute to open-source projects in the ${careerGoal.split(" ")[0]} domain`,
			`Recreate a real-world workflow using ${profile.tools.slice(0, 2).join(" + ")}`,
		],
		assessment: buildMockAssessment(careerGoal),
	};
}

function buildMockAssessment(careerGoal: string) {
	const assessments: Record<
		string,
		{ question: string; options: string[]; answer: string }[]
	> = {
		"AI / Machine Learning Engineer": [
			{
				question: "Which metric is best for imbalanced classification?",
				options: ["Accuracy", "F1 Score", "MSE", "R²"],
				answer: "F1 Score",
			},
			{
				question: "What does gradient descent optimize?",
				options: [
					"Loss function",
					"Learning rate only",
					"Dataset size",
					"Batch count",
				],
				answer: "Loss function",
			},
			{
				question: "Which library is commonly used for deep learning?",
				options: ["Pandas", "PyTorch", "Express", "Terraform"],
				answer: "PyTorch",
			},
			{
				question: "What is overfitting?",
				options: [
					"Model performs well on training but poorly on new data",
					"Model is too simple",
					"Data is too large",
					"Learning rate is zero",
				],
				answer: "Model performs well on training but poorly on new data",
			},
			{
				question: "What is the purpose of cross-validation?",
				options: [
					"Reduce training time",
					"Estimate model generalization",
					"Increase dataset size",
					"Remove outliers",
				],
				answer: "Estimate model generalization",
			},
		],
		"Cloud Engineer (AWS / Azure / GCP)": [
			{
				question: "What does IAM control in cloud platforms?",
				options: [
					"Identity and access permissions",
					"Network bandwidth",
					"CPU allocation",
					"Storage encryption keys only",
				],
				answer: "Identity and access permissions",
			},
			{
				question: "What is Infrastructure as Code?",
				options: [
					"Managing infra through declarative config files",
					"Writing app code in the cloud",
					"Manual server setup",
					"Cloud billing optimization",
				],
				answer: "Managing infra through declarative config files",
			},
			{
				question: "Which AWS service provides object storage?",
				options: ["EC2", "S3", "RDS", "Lambda"],
				answer: "S3",
			},
			{
				question: "What is a VPC?",
				options: [
					"Virtual Private Cloud network",
					"Visual Processing Core",
					"Verified Payment Channel",
					"Variable Performance Compute",
				],
				answer: "Virtual Private Cloud network",
			},
			{
				question: "Terraform is primarily used for?",
				options: [
					"Provisioning infrastructure",
					"Container orchestration",
					"Log monitoring",
					"Code compilation",
				],
				answer: "Provisioning infrastructure",
			},
		],
		"Cybersecurity Specialist": [
			{
				question: "What does SIEM stand for?",
				options: [
					"Security Information and Event Management",
					"System Integration Error Monitor",
					"Secure Internet Exchange Module",
					"Software Integrity Evaluation Method",
				],
				answer: "Security Information and Event Management",
			},
			{
				question: "What is a common first step in incident response?",
				options: [
					"Identification",
					"Public disclosure",
					"System wipe",
					"Ignore alerts",
				],
				answer: "Identification",
			},
			{
				question: "Phishing attacks primarily target?",
				options: [
					"Human trust via deceptive messages",
					"Hardware failures",
					"Power outages",
					"DNS caching",
				],
				answer: "Human trust via deceptive messages",
			},
			{
				question: "What does HTTPS provide?",
				options: [
					"Encrypted communication",
					"Faster page loads only",
					"Unlimited bandwidth",
					"Automatic backups",
				],
				answer: "Encrypted communication",
			},
			{
				question: "A vulnerability scan is used to?",
				options: [
					"Discover security weaknesses",
					"Encrypt databases",
					"Deploy applications",
					"Monitor CPU usage",
				],
				answer: "Discover security weaknesses",
			},
		],
		"Frontend Engineer": [
			{ question: "Which hook is used for side effects in React?", options: ["useEffect", "useState", "useContext", "useReducer"], answer: "useEffect" },
			{ question: "What does CSS Flexbox primarily handle?", options: ["One-dimensional layout", "Two-dimensional layout", "Animation", "Database queries"], answer: "One-dimensional layout" },
			{ question: "What is the virtual DOM?", options: ["A lightweight copy of the real DOM", "The browser's rendering engine", "A database for components", "A CSS framework"], answer: "A lightweight copy of the real DOM" },
			{ question: "Next.js is primarily a...", options: ["React framework", "CSS preprocessor", "Database ORM", "Testing library"], answer: "React framework" },
			{ question: "What does WCAG stand for?", options: ["Web Content Accessibility Guidelines", "Web Component Animation Grid", "Wireless Communication Access Gateway", "World CSS Accessibility Group"], answer: "Web Content Accessibility Guidelines" },
		],
		"Backend Engineer": [
			{ question: "Which HTTP method is idempotent?", options: ["PUT", "POST", "PATCH", "DELETE"], answer: "PUT" },
			{ question: "What is a database index used for?", options: ["Speed up queries", "Store backups", "Encrypt data", "Manage users"], answer: "Speed up queries" },
			{ question: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Automated, Consistent, Integrated, Durable", "Access, Control, Integrity, Data", "Async, Concurrent, Isolated, Distributed"], answer: "Atomicity, Consistency, Isolation, Durability" },
			{ question: "What is a reverse proxy?", options: ["A server that forwards requests to backend servers", "A database replica", "A client-side cache", "A load testing tool"], answer: "A server that forwards requests to backend servers" },
			{ question: "Which of these is a message queue system?", options: ["Kafka", "PostgreSQL", "Redis", "Nginx"], answer: "Kafka" },
		],
		"Full-Stack Developer": [
			{ question: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Central Object Routing System", "Component Order Resolution Standard", "Code Optimization Runtime Service"], answer: "Cross-Origin Resource Sharing" },
			{ question: "Which database is document-oriented?", options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"], answer: "MongoDB" },
			{ question: "What is a JWT?", options: ["JSON Web Token", "Java Web Tool", "JavaScript Widget Template", "JSON Workflow Trigger"], answer: "JSON Web Token" },
			{ question: "What does CI/CD stand for?", options: ["Continuous Integration / Continuous Deployment", "Code Integration / Code Delivery", "Continuous Improvement / Continuous Development", "Compiled Implementation / Compiled Deployment"], answer: "Continuous Integration / Continuous Deployment" },
			{ question: "Which hook manages local state in React?", options: ["useState", "useEffect", "useRef", "useMemo"], answer: "useState" },
		],
		"DevOps / Platform Engineer": [
			{ question: "What is Kubernetes used for?", options: ["Container orchestration", "Database management", "Frontend rendering", "API development"], answer: "Container orchestration" },
			{ question: "What does IaC stand for?", options: ["Infrastructure as Code", "Integration as Container", "Interface as Configuration", "Infrastructure as Compute"], answer: "Infrastructure as Code" },
			{ question: "Which tool is used for infrastructure provisioning?", options: ["Terraform", "Jest", "Webpack", "Babel"], answer: "Terraform" },
			{ question: "What is a pod in Kubernetes?", options: ["The smallest deployable unit", "A load balancer", "A storage volume", "A network policy"], answer: "The smallest deployable unit" },
			{ question: "Prometheus is used for...", options: ["Monitoring and alerting", "Container runtime", "CI/CD pipelines", "Secret management"], answer: "Monitoring and alerting" },
		],
		"Software Engineer (Product-Based Companies)": [
			{ question: "What is the time complexity of binary search?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], answer: "O(log n)" },
			{ question: "What data structure uses FIFO?", options: ["Queue", "Stack", "Tree", "Graph"], answer: "Queue" },
			{ question: "What is a hash collision?", options: ["Two keys produce the same hash", "A database failure", "A network error", "A type mismatch"], answer: "Two keys produce the same hash" },
			{ question: "Which design pattern ensures a class has only one instance?", options: ["Singleton", "Factory", "Observer", "Decorator"], answer: "Singleton" },
			{ question: "What is load balancing?", options: ["Distributing traffic across servers", "Optimizing database queries", "Compressing files", "Minifying code"], answer: "Distributing traffic across servers" },
		],
		"Data Analyst": [
			{ question: "What SQL clause filters grouped data?", options: ["HAVING", "WHERE", "FILTER", "GROUP"], answer: "HAVING" },
			{ question: "What does a JOIN do in SQL?", options: ["Combines rows from two tables", "Creates a new table", "Deletes duplicate rows", "Sorts results"], answer: "Combines rows from two tables" },
			{ question: "What is a primary key?", options: ["A unique identifier for a row", "A foreign reference", "An index", "A constraint"], answer: "A unique identifier for a row" },
			{ question: "What does p-value represent?", options: ["Probability of observing data given null hypothesis", "The effect size", "Sample mean", "Standard deviation"], answer: "Probability of observing data given null hypothesis" },
			{ question: "Tableau is primarily used for...", options: ["Data visualization", "Database management", "ETL pipelines", "Machine learning"], answer: "Data visualization" },
		],
		"Data Engineer": [
			{ question: "What is an ETL pipeline?", options: ["Extract, Transform, Load", "Eliminate, Test, Log", "Encrypt, Transfer, Link", "Evaluate, Transform, Load"], answer: "Extract, Transform, Load" },
			{ question: "Apache Spark is used for...", options: ["Distributed data processing", "Web development", "Mobile apps", "Design"], answer: "Distributed data processing" },
			{ question: "What is a data warehouse?", options: ["Central repository for analytics data", "A physical storage device", "A caching layer", "A message queue"], answer: "Central repository for analytics data" },
			{ question: "dbt is primarily used for...", options: ["Data transformations", "Data visualization", "Orchestration", "Streaming"], answer: "Data transformations" },
			{ question: "What is Apache Kafka?", options: ["A distributed streaming platform", "A SQL database", "A frontend framework", "A testing tool"], answer: "A distributed streaming platform" },
		],
		"Mobile Developer": [
			{ question: "Swift is used primarily for...", options: ["iOS development", "Android development", "Web development", "Data science"], answer: "iOS development" },
			{ question: "What is Jetpack Compose?", options: ["Android's modern UI toolkit", "A Kotlin compiler", "A dependency injector", "A testing framework"], answer: "Android's modern UI toolkit" },
			{ question: "What is an APK?", options: ["Android Package Kit", "Application Program Key", "Active Process Kernel", "Apple Package Kit"], answer: "Android Package Kit" },
			{ question: "What does React Native allow?", options: ["Build mobile apps with JavaScript", "Build web apps only", "Manage databases", "Design UI mockups"], answer: "Build mobile apps with JavaScript" },
			{ question: "What is App Store Connect used for?", options: ["Managing iOS app submissions", "Android app deployment", "Web hosting", "Database management"], answer: "Managing iOS app submissions" },
		],
		"Data Scientist": [
			{ question: "What is overfitting?", options: ["Model performs well on training but poorly on test data", "Model is too simple", "Data is too large", "Learning rate is zero"], answer: "Model performs well on training but poorly on test data" },
			{ question: "What is the purpose of cross-validation?", options: ["Estimate model generalization", "Reduce training time", "Increase dataset size", "Remove outliers"], answer: "Estimate model generalization" },
			{ question: "Which metric is best for imbalanced classification?", options: ["F1 Score", "Accuracy", "MSE", "R²"], answer: "F1 Score" },
			{ question: "What is A/B testing?", options: ["Comparing two versions to determine which performs better", "Testing database performance", "A security audit method", "A deployment strategy"], answer: "Comparing two versions to determine which performs better" },
			{ question: "What does causal inference aim to do?", options: ["Determine cause-and-effect relationships", "Correlate variables", "Classify data", "Cluster observations"], answer: "Determine cause-and-effect relationships" },
		],
		"Site Reliability Engineer (SRE)": [
			{ question: "What is an SLO?", options: ["Service Level Objective", "System Load Optimizer", "Server Log Output", "Secure Login Operation"], answer: "Service Level Objective" },
			{ question: "What is an error budget?", options: ["The acceptable amount of downtime", "A financial budget for errors", "The number of bugs allowed", "A testing metric"], answer: "The acceptable amount of downtime" },
			{ question: "What is chaos engineering?", options: ["Testing system resilience by injecting failures", "Random server shutdowns", "A deployment strategy", "A monitoring tool"], answer: "Testing system resilience by injecting failures" },
			{ question: "What does a postmortem document?", options: ["Incident analysis and follow-up actions", "Project timeline", "Budget report", "Feature specification"], answer: "Incident analysis and follow-up actions" },
			{ question: "Prometheus is used for...", options: ["Monitoring and alerting", "Container runtime", "CI/CD pipelines", "Secret management"], answer: "Monitoring and alerting" },
		],
		"UI/UX Designer": [
			{ question: "What is a wireframe?", options: ["A low-fidelity layout of a page", "A high-fidelity prototype", "A color palette", "A font family"], answer: "A low-fidelity layout of a page" },
			{ question: "What does usability testing measure?", options: ["How easy a product is to use", "How fast a page loads", "How secure an app is", "How much storage is used"], answer: "How easy a product is to use" },
			{ question: "What is a design system?", options: ["A collection of reusable components and guidelines", "A color picker tool", "A font library", "A prototyping tool"], answer: "A collection of reusable components and guidelines" },
			{ question: "What is information architecture?", options: ["Organizing and structuring content", "Designing databases", "Building APIs", "Writing code"], answer: "Organizing and structuring content" },
			{ question: "Figma is primarily used for...", options: ["Interface design and prototyping", "Code editing", "Database management", "Server deployment"], answer: "Interface design and prototyping" },
		],
		"Product Manager": [
			{ question: "What is a PRD?", options: ["Product Requirements Document", "Performance Review Document", "Project Resource Dashboard", "Product Return Directive"], answer: "Product Requirements Document" },
			{ question: "What are OKRs?", options: ["Objectives and Key Results", "Operational Key Resources", "Organizational Knowledge Reports", "Outcome Key Requirements"], answer: "Objectives and Key Results" },
			{ question: "What is a user story?", options: ["A short description of a feature from user perspective", "A technical specification", "A bug report", "A design mockup"], answer: "A short description of a feature from user perspective" },
			{ question: "What does A/B testing help determine?", options: ["Which version performs better", "Which server is faster", "Which database is more reliable", "Which API is more secure"], answer: "Which version performs better" },
			{ question: "What is a roadmap?", options: ["A strategic plan for product development", "A list of bugs to fix", "A design file", "A marketing plan"], answer: "A strategic plan for product development" },
		],
		"Forward Deployed Engineer": [
			{ question: "What is an MVP?", options: ["Minimum Viable Product", "Most Valuable Player", "Maximum Velocity Protocol", "Managed Virtual Platform"], answer: "Minimum Viable Product" },
			{ question: "What is API integration?", options: ["Connecting systems through their APIs", "Designing user interfaces", "Managing databases", "Writing documentation"], answer: "Connecting systems through their APIs" },
			{ question: "What is CI/CD?", options: ["Continuous Integration and Continuous Deployment", "Code Implementation and Code Design", "Continuous Improvement and Continuous Delivery", "Compiled Integration and Compiled Deployment"], answer: "Continuous Integration and Continuous Deployment" },
			{ question: "What is a POC?", options: ["Proof of Concept", "Point of Contact", "Process of Compilation", "Product Optimization Cycle"], answer: "Proof of Concept" },
			{ question: "Terraform is used for...", options: ["Infrastructure provisioning", "Container orchestration", "Frontend development", "Data analysis"], answer: "Infrastructure provisioning" },
		],
	};

	return (
		assessments[careerGoal] || [
			{
				question: "What is the purpose of version control?",
				options: [
					"Track code changes collaboratively",
					"Compile code faster",
					"Design UI layouts",
					"Host websites",
				],
				answer: "Track code changes collaboratively",
			},
			{
				question: "Which HTTP method is idempotent?",
				options: ["GET", "POST", "PATCH", "CONNECT"],
				answer: "GET",
			},
			{
				question: "What does API stand for?",
				options: [
					"Application Programming Interface",
					"Automated Process Integration",
					"Applied Protocol Instance",
					"Application Performance Index",
				],
				answer: "Application Programming Interface",
			},
			{
				question: "Docker is primarily used for?",
				options: [
					"Containerization",
					"Spreadsheet analysis",
					"Network routing",
					"Image editing",
				],
				answer: "Containerization",
			},
			{
				question: "What is unit testing?",
				options: [
					"Testing individual components in isolation",
					"Testing entire production systems only",
					"Manual UI review",
					"Load testing at scale",
				],
				answer: "Testing individual components in isolation",
			},
		]
	);
}

export function applyResumeScores(
	result: Record<string, unknown>,
	careerGoal: string,
): ResumeAnalysisResult {
	const skills = resolveAliases(Array.isArray(result?.skills) ? result.skills : []);
	const softSkills = Array.isArray(result?.softSkills) ? result.softSkills : [];
	const experience = Array.isArray(result?.experience) ? result.experience : [];
	const education = Array.isArray(result?.education) ? result.education : [];
	const summary = typeof result?.summary === "string" ? result.summary : "";

	const strengths = Array.isArray(result?.strengths) ? result.strengths : [];
	const improvements = Array.isArray(result?.improvements)
		? result.improvements
		: [];
	const atsTips = Array.isArray(result?.atsTips) ? result.atsTips : [];

	const profile = getCareerProfile(careerGoal);
	const matchedCore = profile.coreSkills.filter((s) =>
		skills.some((us: string) =>
			us.toLowerCase() === s.toLowerCase(),
		),
	);

	const rawScore =
		typeof result?.resumeScore === "number" ? result.resumeScore : 70;
	const careerFit = result?.careerFit as
		| { score?: number; summary?: string }
		| undefined;
	const careerFitScore =
		careerFit && typeof careerFit.score === "number"
			? careerFit.score
			: Math.max(35, 55 + matchedCore.length * 5);

	const careerFitSummary =
		careerFit && typeof careerFit.summary === "string"
			? careerFit.summary
			: `Your profile has a fit score of ${careerFitScore} for ${careerGoal}.`;

	return {
		skills,
		softSkills,
		experience,
		education,
		summary,
		resumeScore: rawScore,
		strengths,
		improvements,
		atsTips,
		careerFit: {
			score: careerFitScore,
			summary: careerFitSummary,
		},
	};
}

export function applySkillGapScores(
	result: Record<string, unknown>,
	skills: string[],
	careerGoal: string,
	experience?: { role: string; company: string; duration: string }[],
	_education?: { degree: string; school: string; year: string }[],
	experienceLevel?: ExperienceLevel,
	customWeights?: { weightedSkills: WeightedSkill[]; coreSkills: string[]; tools: string[] },
	repoSkills?: Set<string>,
	seniorityPostingSkills?: Set<string>,
): SkillGapAnalysisResult {
	const level = experienceLevel || inferExperienceLevel(experience);
	const { profile, strong, improving, weak, skillCategories, gapPriority } =
		categorizeSkillsForGoal(skills, careerGoal, level, customWeights, repoSkills, seniorityPostingSkills);

	const finalStrong = Array.isArray(result?.strong)
		? (result.strong as string[])
		: strong.length
			? strong
			: [];
	const finalImproving = Array.isArray(result?.improving)
		? (result.improving as string[])
		: improving.length
			? improving
			: [];
	const finalWeakRaw = Array.isArray(result?.weak)
		? (result.weak as string[])
		: weak.length
			? weak
			: profile.coreSkills.slice(0, 4);

	// Sort weak by market relevance so market-critical gaps get priority
	const finalWeak =
		seniorityPostingSkills && seniorityPostingSkills.size > 0
			? [...finalWeakRaw].sort((a, b) => {
					const aInMarket = seniorityPostingSkills.has(a) ? 0 : 1;
					const bInMarket = seniorityPostingSkills.has(b) ? 0 : 1;
					return aInMarket - bInMarket;
				})
			: finalWeakRaw;

	const rawScore =
		typeof result?.matchScore === "number" ? result.matchScore : null;
	const calculatedScore = Math.max(
		25,
		Math.min(
			95,
			Math.round((strong.length / (strong.length + weak.length + 1)) * 100),
		),
	);
	const matchScore = rawScore !== null ? rawScore : calculatedScore;

	const defaultPriorityGaps = finalWeak
		.slice(0, 5)
		.map((skill: string, i: number) => {
			const inMarket = seniorityPostingSkills?.has(skill);
			return {
				skill,
				importance: (inMarket
					? i < 2 ? "high" : "medium"
					: "low") as "high" | "medium" | "low",
				reason: inMarket
					? `Appears in job postings — market-critical for ${careerGoal}`
					: `Nice-to-have for ${careerGoal} — adds hiring advantage`,
			};
		});
	const priorityGaps = Array.isArray(result?.priorityGaps)
		? result.priorityGaps
		: defaultPriorityGaps;

	const finalSkillCategories =
		(result?.skillCategories as typeof skillCategories) || skillCategories;

	const roadmapsByGoal = getRoadmapsByGoal();

	const roadmap = Array.isArray(result?.roadmap)
		? result.roadmap
		: roadmapsByGoal[careerGoal] || buildDefaultRoadmap(profile, careerGoal);

	const expNote =
		experience && experience.length > 0
			? ` Your ${experience[0].role} experience is a good foundation.`
			: "";
	const coach =
		typeof result?.coach === "string"
			? result.coach
			: `You're on a solid path toward ${careerGoal}.${expNote} Your strongest areas include ${finalStrong.slice(0, 3).join(", ") || "foundational programming"}. Prioritize closing gaps in ${finalWeak.slice(0, 3).join(", ") || "role-specific tools"} through focused projects and structured learning over the next ${profile.typicalTimeline}.`;

	const timeToGoal =
		typeof result?.timeToGoal === "string"
			? result.timeToGoal
			: profile.typicalTimeline;
	const recommendedCertifications = Array.isArray(
		result?.recommendedCertifications,
	)
		? result.recommendedCertifications
		: profile.certifications.slice(0, 3);
	const projectIdeas = Array.isArray(result?.projectIdeas)
		? result.projectIdeas
		: [
				`Build a portfolio project showcasing ${profile.tools[0]} and ${profile.coreSkills[0]}`,
				`Contribute to open-source projects in the ${careerGoal.split(" ")[0]} domain`,
				`Recreate a real-world workflow using ${profile.tools.slice(0, 2).join(" + ")}`,
			];

	const assessment = Array.isArray(result?.assessment)
		? result.assessment
		: buildMockAssessment(careerGoal);

	const finalGapPriority = computeGapPriority(
		finalWeak,
		profile.weightedSkills,
		seniorityPostingSkills,
	);

	return {
		matchScore,
		strong: finalStrong,
		improving: finalImproving,
		weak: finalWeak,
		gapPriority: finalGapPriority,
		priorityGaps,
		skillCategories: finalSkillCategories,
		roadmap,
		coach,
		timeToGoal,
		recommendedCertifications,
		projectIdeas,
		assessment,
	};
}

export async function analyzeResume(data: {
	file: string;
	fileName?: string;
	mimeType?: string;
	careerGoal?: string;
}): Promise<ResumeAnalysisResult> {
	const pdfError = validateResumePdf(data.file, data.mimeType, data.fileName);
	if (pdfError) {
		throw new Error(pdfError);
	}

	const targetGoal = data.careerGoal || "Full-Stack Developer";
	const prompt = buildResumeAnalysisPrompt(targetGoal);

	console.log("Analyzing resume file:", data.fileName, "for goal:", targetGoal);
	const result = await callAI(prompt, {
		base64: data.file,
		mimeType: "application/pdf",
	});

	if (result) {
		return applyResumeScores(result, targetGoal);
	}

	return buildMockResumeAnalysis(targetGoal);
}

function levelToSeniority(level: ExperienceLevel): string {
	if (level === "fresher") return "junior";
	return level;
}

export async function analyzeSkillGap(
	userId: string,
	skills: string[],
	careerGoal: string,
	experience?: { role: string; company: string; duration: string }[],
	education?: { degree: string; school: string; year: string }[],
	experienceLevel?: ExperienceLevel,
): Promise<AnalyzeSkillGapResponse> {
	const level = experienceLevel || inferExperienceLevel(experience);

	const [marketProfile, repos, seniorityPostings] = await Promise.all([
		getMarketProfile(careerGoal),
		prisma.repository.findMany({
			where: { userId },
			select: { language: true, name: true, description: true },
		}),
		prisma.jobPosting.findMany({
			where: { careerGoal, seniority: levelToSeniority(level) },
			select: { requiredSkills: true, niceToHaveSkills: true },
		}),
	]);

	const customWeights = marketProfile
		? mergeProfiles(marketProfile, careerGoal)
		: undefined;

	const marketContext = marketProfile
		? {
				topCompanies: marketProfile.topCompanies,
				marketDemandedSkills: marketProfile.weightedSkills
					.filter((s) => s.weight >= 7)
					.map((s) => s.name)
					.slice(0, 10),
			}
		: undefined;

	const repoSkills = inferSkillsFromRepos(repos);

	const seniorityPostingSkills = new Set<string>();
	for (const p of seniorityPostings) {
		const required = p.requiredSkills as string[];
		const niceToHave = p.niceToHaveSkills as string[];
		for (const s of required) seniorityPostingSkills.add(s);
		for (const s of niceToHave) seniorityPostingSkills.add(s);
	}

	const prompt = buildSkillGapAnalysisPrompt(
		skills,
		careerGoal,
		experience,
		education,
		marketContext,
	);

	let result: SkillGapAnalysisResult = (await callAI(
		prompt,
	)) as unknown as SkillGapAnalysisResult;
	if (!result) {
		result = buildMockSkillGap(skills, careerGoal, experience, education, level, customWeights, repoSkills, seniorityPostingSkills);
	} else {
		result = applySkillGapScores(
			result as unknown as Record<string, unknown>,
			skills,
			careerGoal,
			experience,
			education,
			level,
			customWeights,
			repoSkills,
			seniorityPostingSkills,
		);
	}

	const details = extractSkillGapDetails(
		result as unknown as Record<string, unknown>,
	);

	const { skillGapRecord, assessmentRecord } = await prisma.$transaction(
		async (tx) => {
			await tx.user.update({
				where: { id: userId },
				data: { careerGoal, skills },
			});

			await tx.skillGap.deleteMany({ where: { userId } });

			const sgRecord = await tx.skillGap.create({
				data: {
					userId,
					goal: careerGoal,
					matchScore: result.matchScore,
					strong: result.strong,
					improving: result.improving,
					weak: result.weak,
					roadmap: result.roadmap,
					coach: result.coach,
					details: details as Prisma.InputJsonValue,
				},
			});

			await tx.assessment.deleteMany({
				where: { userId, score: null, goal: careerGoal },
			});

			const assRecord = await tx.assessment.create({
				data: {
					userId,
					goal: careerGoal,
					questions: result.assessment,
				},
			});

			return { skillGapRecord: sgRecord, assessmentRecord: assRecord };
		},
	);

	resourceRecommendationNode({
		userId,
		careerGoal,
		status: "running",
		skillGapResult: result,
		aggregatedSkills: [],
		aggregatedExperience: [],
		aggregatedEducation: [],
		resourceRecommendations: [],
	} as AgentState)
		.then((resourceUpdate) =>
			persistResultsNode({
				userId,
				careerGoal,
				status: "running",
				skillGapResult: result,
				aggregatedSkills: [],
				aggregatedExperience: [],
				aggregatedEducation: [],
				resourceRecommendations: [],
				...resourceUpdate,
			} as AgentState),
		)
		.catch((err: unknown) => {
			console.error(
				"Failed to regenerate resources after skill gap analysis:",
				err instanceof Error ? err.message : String(err),
			);
		});

	return {
		skillGap: skillGapRecord,
		assessmentId: assessmentRecord.id,
		questions: assessmentRecord.questions,
	};
}

export async function analyzeResumeAndSkillGap(
	userId: string,
	data: {
		file: string;
		fileName?: string;
		mimeType?: string;
		careerGoal: string;
		experienceLevel?: ExperienceLevel;
	},
): Promise<AnalyzeSkillGapResponse & { resume: ResumeAnalysisResult }> {
	const resumeResult = await analyzeResume({
		file: data.file,
		fileName: data.fileName,
		mimeType: data.mimeType,
		careerGoal: data.careerGoal,
	});

	const skillGapResult = await analyzeSkillGap(
		userId,
		resumeResult.skills,
		data.careerGoal,
		resumeResult.experience,
		resumeResult.education,
		data.experienceLevel,
	);

	return { ...skillGapResult, resume: resumeResult };
}

export async function getLatestSkillGap(
	userId: string,
): Promise<LatestSkillGapResponse> {
	const [skillGap, userRecord] = await Promise.all([
		prisma.skillGap.findFirst({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		}),
		prisma.user.findUnique({ where: { id: userId } }),
	]);

	if (!skillGap) {
		return {
			message: "No skill gap analysis found. Please run an analysis first.",
		} as unknown as LatestSkillGapResponse;
	}

	const activeAssessment = await prisma.assessment.findFirst({
		where: { userId, goal: skillGap.goal },
		orderBy: { createdAt: "desc" },
	});

	return {
		skillGap,
		careerGoal: userRecord?.careerGoal ?? null,
		skills: userRecord?.skills || [],
		activeAssessmentId: activeAssessment?.id ?? null,
		questions: activeAssessment?.questions ?? null,
		latestScore: activeAssessment?.score ?? null,
	};
}

function getRoadmapsByGoal(): Record<
	string,
	{ step: string; details: string; duration: string }[]
> {
	return {
		"AI / Machine Learning Engineer": [
			{ step: "Math & Python Foundations", details: "Linear algebra, statistics, NumPy, Pandas", duration: "3 weeks" },
			{ step: "ML Fundamentals", details: "Scikit-learn, supervised/unsupervised learning, model evaluation", duration: "4 weeks" },
			{ step: "Deep Learning", details: "Neural networks with PyTorch or TensorFlow", duration: "4 weeks" },
			{ step: "MLOps & Deployment", details: "Model serving, MLflow, cloud deployment", duration: "3 weeks" },
			{ step: "Capstone Project", details: "End-to-end ML project with dataset, training, and deployment", duration: "4 weeks" },
		],
		"Cloud Engineer (AWS / Azure / GCP)": [
			{ step: "Cloud Fundamentals", details: "IAM, VPC, compute, storage across AWS/Azure/GCP", duration: "3 weeks" },
			{ step: "Infrastructure as Code", details: "Terraform and CloudFormation templates", duration: "3 weeks" },
			{ step: "Networking & Security", details: "Load balancers, DNS, security groups, encryption", duration: "3 weeks" },
			{ step: "Containers on Cloud", details: "ECS/EKS, Azure AKS, GKE basics", duration: "3 weeks" },
			{ step: "Certification Prep", details: "Practice exams and hands-on labs", duration: "4 weeks" },
		],
		"Cybersecurity Specialist": [
			{ step: "Security Foundations", details: "Networking, OS hardening, security policies", duration: "3 weeks" },
			{ step: "Threat & Vulnerability", details: "Nmap, vulnerability scanning, risk assessment", duration: "3 weeks" },
			{ step: "Defensive Operations", details: "SIEM, log analysis, incident response playbooks", duration: "4 weeks" },
			{ step: "Offensive Basics (Ethical)", details: "Burp Suite, penetration testing methodology", duration: "3 weeks" },
			{ step: "Certification & Labs", details: "Security+ study plan with TryHackMe/HTB labs", duration: "5 weeks" },
		],
		"Backend Engineer": [
			{ step: "API & Database Design", details: "RESTful APIs, SQL, database normalization, indexing", duration: "3 weeks" },
			{ step: "System Design Basics", details: "Load balancing, caching, microservices, messaging queues", duration: "4 weeks" },
			{ step: "Authentication & Security", details: "JWT, OAuth, RBAC, encryption, secure API patterns", duration: "2 weeks" },
			{ step: "Performance & Testing", details: "Load testing, query optimization, profiling, CI/CD", duration: "3 weeks" },
			{ step: "Production Deployment", details: "Docker, Kubernetes, cloud deployment, monitoring", duration: "3 weeks" },
		],
		"Frontend Engineer": [
			{ step: "HTML/CSS Foundations", details: "Semantic HTML, CSS layout, Flexbox, Grid, responsive design", duration: "2 weeks" },
			{ step: "JavaScript & TypeScript", details: "ES6+, closures, async/await, TypeScript types and generics", duration: "3 weeks" },
			{ step: "React Deep Dive", details: "Hooks, context, state management, performance optimization", duration: "4 weeks" },
			{ step: "Modern Tooling", details: "Next.js, Tailwind CSS, Vite, testing with Jest/RTL", duration: "3 weeks" },
			{ step: "Accessibility & Performance", details: "Core Web Vitals, ARIA, lazy loading, code splitting", duration: "2 weeks" },
		],
		"Full-Stack Developer": [
			{ step: "Frontend Foundations", details: "React, TypeScript, CSS, responsive patterns", duration: "3 weeks" },
			{ step: "Backend & API Development", details: "Node.js, Express, REST APIs, authentication", duration: "3 weeks" },
			{ step: "Database & Storage", details: "PostgreSQL, MongoDB, Redis, Prisma ORM", duration: "3 weeks" },
			{ step: "DevOps & Deployment", details: "Docker, CI/CD, cloud deployment (Vercel/AWS)", duration: "3 weeks" },
			{ step: "Full-Stack Capstone", details: "Build a complete SaaS app with auth, payments, and database", duration: "4 weeks" },
		],
		"DevOps / Platform Engineer": [
			{ step: "Linux & Scripting", details: "Command line, bash scripting, process management", duration: "2 weeks" },
			{ step: "Containerization", details: "Docker, Docker Compose, container networking", duration: "2 weeks" },
			{ step: "Container Orchestration", details: "Kubernetes: pods, services, deployments, Helm", duration: "4 weeks" },
			{ step: "CI/CD & Automation", details: "GitHub Actions, Terraform, Ansible, infrastructure as code", duration: "3 weeks" },
			{ step: "Monitoring & Reliability", details: "Prometheus, Grafana, SLOs, incident response", duration: "3 weeks" },
		],
		"Software Engineer (Product-Based Companies)": [
			{ step: "Data Structures & Algorithms", details: "Arrays, trees, graphs, DP, hash tables — solve 100+ problems", duration: "6 weeks" },
			{ step: "System Design", details: "Scalability, distributed systems, design interviews prep", duration: "4 weeks" },
			{ step: "Object-Oriented Design", details: "SOLID, design patterns, clean architecture", duration: "3 weeks" },
			{ step: "Testing & Code Quality", details: "Unit tests, integration tests, code reviews, CI", duration: "2 weeks" },
			{ step: "Interview Preparation", details: "Mock interviews, behavioral prep, portfolio projects", duration: "4 weeks" },
		],
		"Data Analyst": [
			{ step: "SQL & Statistics", details: "Advanced SQL, window functions, statistical foundations", duration: "3 weeks" },
			{ step: "Data Visualization", details: "Tableau, Power BI, matplotlib, storytelling with data", duration: "3 weeks" },
			{ step: "Python for Analytics", details: "Pandas, NumPy, data cleaning, exploratory analysis", duration: "3 weeks" },
			{ step: "Experimental Design", details: "A/B testing, hypothesis testing, causal inference", duration: "3 weeks" },
			{ step: "Capstone: Business Analytics", details: "End-to-end analysis with real dataset, dashboard, and recommendations", duration: "3 weeks" },
		],
		"Data Engineer": [
			{ step: "SQL & Data Modeling", details: "Advanced SQL, dimensional modeling, star/snowflake schemas", duration: "3 weeks" },
			{ step: "Python & ETL", details: "Python data pipelines, ETL/ELT patterns, Airflow basics", duration: "3 weeks" },
			{ step: "Big Data Tools", details: "Apache Spark, Kafka, data warehousing with Snowflake/BigQuery", duration: "4 weeks" },
			{ step: "Modern Data Stack", details: "dbt, Airflow, Docker, data quality testing", duration: "3 weeks" },
			{ step: "Production Data Pipelines", details: "Build a real-time data pipeline with monitoring and alerting", duration: "4 weeks" },
		],
		"Mobile Developer": [
			{ step: "Mobile Platform Basics", details: "iOS with Swift/SwiftUI or Android with Kotlin/Jetpack Compose", duration: "4 weeks" },
			{ step: "Mobile Architecture", details: "MVVM, Clean Architecture, navigation patterns", duration: "3 weeks" },
			{ step: "Networking & Storage", details: "REST APIs, local storage, Firebase, Core Data/Room", duration: "3 weeks" },
			{ step: "UI/UX & Performance", details: "Material Design/HIG, animations, memory management", duration: "2 weeks" },
			{ step: "App Store & Deployment", details: "App Store Connect/Google Play, CI/CD, monitoring", duration: "2 weeks" },
		],
		"Data Scientist": [
			{ step: "Statistics & Probability", details: "Bayesian stats, hypothesis testing, regression analysis", duration: "3 weeks" },
			{ step: "Machine Learning", details: "Supervised/unsupervised learning, feature engineering, model selection", duration: "4 weeks" },
			{ step: "Experimental Design", details: "A/B testing, confounding variables, power analysis, causal inference", duration: "3 weeks" },
			{ step: "Data Wrangling & Visualization", details: "Pandas, matplotlib, seaborn, communicating insights", duration: "3 weeks" },
			{ step: "Capstone: Data Science Project", details: "End-to-end ML project with real data, experimentation, and presentation", duration: "4 weeks" },
		],
		"Site Reliability Engineer (SRE)": [
			{ step: "Linux & Systems", details: "Linux internals, system calls, process management, networking stack", duration: "3 weeks" },
			{ step: "Monitoring & Observability", details: "Prometheus, Grafana, distributed tracing, logging", duration: "3 weeks" },
			{ step: "Incident Response & Reliability", details: "SLOs, error budgets, incident management, postmortems", duration: "3 weeks" },
			{ step: "Automation & Scripting", details: "Go/Python scripting, infrastructure automation, chaos engineering", duration: "4 weeks" },
			{ step: "Distributed Systems", details: "Consensus algorithms, distributed storage, CDN, load balancing", duration: "4 weeks" },
		],
		"UI/UX Designer": [
			{ step: "Design Fundamentals", details: "Color theory, typography, layout, visual hierarchy", duration: "2 weeks" },
			{ step: "User Research", details: "User interviews, surveys, usability testing, persona creation", duration: "3 weeks" },
			{ step: "Wireframing & Prototyping", details: "Figma, Sketch, low/high fidelity wireframes, interactive prototypes", duration: "3 weeks" },
			{ step: "Design Systems", details: "Component libraries, design tokens, accessibility, Storybook", duration: "3 weeks" },
			{ step: "Portfolio & Case Studies", details: "Build 3 case studies with research, iterations, and final designs", duration: "4 weeks" },
		],
		"Product Manager": [
			{ step: "Product Thinking", details: "Product strategy, user stories, OKRs, prioritization frameworks", duration: "3 weeks" },
			{ step: "Analytics & Experimentation", details: "Metrics, A/B testing, Amplitude/Mixpanel, data-driven decisions", duration: "3 weeks" },
			{ step: "Stakeholder Management", details: "Cross-functional collaboration, executive communication, roadmapping", duration: "2 weeks" },
			{ step: "Market & User Research", details: "Competitive analysis, user interviews, market sizing, TAM", duration: "3 weeks" },
			{ step: "Build a Product Portfolio", details: "Define, launch, and iterate a product concept with PRD and metrics", duration: "4 weeks" },
		],
		"Forward Deployed Engineer": [
			{ step: "Full-Stack Foundations", details: "TypeScript, React, Node.js, databases, REST APIs", duration: "3 weeks" },
			{ step: "API Integration & Deployment", details: "Third-party API integration, CI/CD, cloud deployment", duration: "3 weeks" },
			{ step: "Client & Consulting Skills", details: "Requirements gathering, technical demos, communication", duration: "2 weeks" },
			{ step: "Rapid Prototyping", details: "Build MVPs quickly, iterate based on feedback, POC delivery", duration: "3 weeks" },
			{ step: "Production & Scale", details: "Monitoring, alerting, Terraform, production troubleshooting", duration: "3 weeks" },
		],
	};
}

function buildDefaultRoadmap(profile: CareerGoalProfile, careerGoal: string): { step: string; details: string; duration: string }[] {
	return [
		{ step: "Strengthen Core Skills", details: `Master ${profile.coreSkills.slice(0, 2).join(" and ")}`, duration: "2-3 weeks" },
		{ step: "Learn Essential Tools", details: `Hands-on with ${profile.tools.slice(0, 3).join(", ")}`, duration: "3 weeks" },
		{ step: "Build Portfolio Project", details: `Create a project demonstrating ${careerGoal} skills`, duration: "3-4 weeks" },
		{ step: "Practice & Interview Prep", details: "Mock interviews, coding challenges, system design basics", duration: "3 weeks" },
		{ step: "Apply & Iterate", details: "Target internships/junior roles, refine resume based on feedback", duration: "Ongoing" },
	];
}
