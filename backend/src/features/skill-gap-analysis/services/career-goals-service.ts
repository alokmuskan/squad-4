import type { MarketDerivedProfile, WeightedSkill } from "../types/skill-gap.types";
import { retrieveJobPostings } from "@/services/rag/retrievers";
import { resolveAliases } from "@/utils/skill-matching";

const REPO_SKILL_KEYWORDS: Record<string, string> = {
	react: "React", node: "Node.js", express: "Express.js",
	mongodb: "MongoDB", mysql: "MySQL", postgresql: "PostgreSQL",
	docker: "Docker", kubernetes: "Kubernetes", aws: "AWS",
	graphql: "GraphQL", redux: "Redux", nextjs: "Next.js",
	"next.js": "Next.js", vue: "Vue.js", angular: "Angular",
	tailwind: "Tailwind CSS", django: "Django", flask: "Flask",
	spring: "Spring Boot", tensorflow: "TensorFlow", pytorch: "PyTorch",
	git: "Git", linux: "Linux", terraform: "Terraform",
	"ci/cd": "CI/CD", kafka: "Kafka", redis: "Redis",
	"rest api": "REST APIs", api: "REST APIs",
	pandas: "Pandas", numpy: "NumPy", scikit: "Scikit-learn",
	"machine learning": "Machine Learning", "deep learning": "Deep Learning",
	typescript: "TypeScript", javascript: "JavaScript", python: "Python",
	java: "Java", go: "Go", rust: "Rust", cplusplus: "C++",
	csharp: "C#", kotlin: "Kotlin", swift: "Swift",
	sql: "SQL", html: "HTML", css: "CSS",
	bash: "Bash", shell: "Shell Scripting",
};

export function inferSkillsFromRepos(
	repos: { language: string | null; name: string; description: string | null }[],
): Set<string> {
	const skills = new Set<string>();
	for (const repo of repos) {
		if (repo.language) skills.add(repo.language);
		const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
	for (const [keyword, skill] of Object.entries(REPO_SKILL_KEYWORDS)) {
		const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) skills.add(skill);
	}
	}
	return skills;
}

function getSeniorityPostingSkills(
	seniorityPostingSkills?: Set<string>,
): Set<string> | undefined {
	return seniorityPostingSkills && seniorityPostingSkills.size > 0
		? seniorityPostingSkills
		: undefined;
}

function getWeightMap(weightedSkills: WeightedSkill[]): Map<string, number> {
	return new Map(weightedSkills.map((s) => [s.name, s.weight]));
}

export function computeGapPriority(
	weakSkills: string[],
	weightedSkills: WeightedSkill[],
	marketSkills?: Set<string>,
): Record<string, "now" | "later"> {
	const weights = getWeightMap(weightedSkills);
	const priority: Record<string, "now" | "later"> = {};
	for (const skill of weakSkills) {
		const w = weights.get(skill) ?? 1;
		if (w >= 7) {
			priority[skill] = "now";
		} else if (w >= 5) {
			priority[skill] = marketSkills?.has(skill) ? "now" : "later";
		} else {
			priority[skill] = "later";
		}
	}
	return priority;
}

export const CAREER_GOALS = [
	"AI / Machine Learning Engineer",
	"Frontend Engineer",
	"Backend Engineer",
	"Full-Stack Developer",
	"Cloud Engineer (AWS / Azure / GCP)",
	"DevOps / Platform Engineer",
	"Data Analyst",
	"Data Engineer",
	"Cybersecurity Specialist",
	"Software Engineer (Product-Based Companies)",
	"Mobile Developer",
	"Data Scientist",
	"Site Reliability Engineer (SRE)",
	"UI/UX Designer",
	"Product Manager",
	"Forward Deployed Engineer",
] as const;

export type CareerGoal = (typeof CAREER_GOALS)[number];

export type ExperienceLevel = "fresher" | "mid" | "senior";

export interface CareerGoalProfile {
	label: CareerGoal;
	coreSkills: string[];
	tools: string[];
	softSkills: string[];
	certifications: string[];
	typicalTimeline: string;
	weightedSkills: WeightedSkill[];
	fresherSkills?: string[];
	seniorSkills?: string[];
}

export const CAREER_GOAL_PROFILES: Record<CareerGoal, CareerGoalProfile> = {
	"AI / Machine Learning Engineer": {
		label: "AI / Machine Learning Engineer",
		coreSkills: [
			"Python",
			"Machine Learning",
			"Deep Learning",
			"Statistics",
			"Linear Algebra",
			"Data Preprocessing",
			"Model Evaluation",
		],
		tools: [
			"TensorFlow",
			"PyTorch",
			"Scikit-learn",
			"Pandas",
			"NumPy",
			"Jupyter",
			"MLflow",
			"CUDA",
		],
		softSkills: [
			"Research mindset",
			"Problem decomposition",
			"Experimentation",
			"Technical writing",
		],
		certifications: [
			"AWS ML Specialty",
			"Google Professional ML Engineer",
			"TensorFlow Developer Certificate",
		],
		typicalTimeline: "6-12 months",
		weightedSkills: [
			{ name: "Python", weight: 10, category: "core" },
			{ name: "Machine Learning", weight: 10, category: "core" },
			{ name: "Deep Learning", weight: 9, category: "core" },
			{ name: "Statistics", weight: 8, category: "core" },
			{ name: "Linear Algebra", weight: 7, category: "core" },
			{ name: "Data Preprocessing", weight: 7, category: "core" },
			{ name: "Model Evaluation", weight: 7, category: "core" },
			{ name: "PyTorch", weight: 9, category: "tool" },
			{ name: "TensorFlow", weight: 8, category: "tool" },
			{ name: "Scikit-learn", weight: 7, category: "tool" },
			{ name: "Pandas", weight: 6, category: "tool" },
			{ name: "NumPy", weight: 6, category: "tool" },
			{ name: "MLflow", weight: 5, category: "tool" },
			{ name: "CUDA", weight: 4, category: "tool" },
			{ name: "Research mindset", weight: 5, category: "soft" },
			{ name: "Problem decomposition", weight: 5, category: "soft" },
			{ name: "Experimentation", weight: 4, category: "soft" },
		],
	},
	"Frontend Engineer": {
		label: "Frontend Engineer",
		coreSkills: [
			"JavaScript",
			"TypeScript",
			"HTML",
			"CSS",
			"React",
			"Responsive Design",
			"Web Performance",
			"Accessibility",
		],
		tools: [
			"React",
			"Next.js",
			"Tailwind CSS",
			"Vite",
			"Git",
			"Figma",
			"Jest",
			"Webpack",
		],
		softSkills: [
			"Attention to detail",
			"Design sense",
			"Collaboration",
			"Code review",
		],
		certifications: ["Meta Front-End Developer", "Google UX Design"],
		typicalTimeline: "3-6 months",
		weightedSkills: [
			{ name: "JavaScript", weight: 10, category: "core" },
			{ name: "TypeScript", weight: 9, category: "core" },
			{ name: "React", weight: 10, category: "core" },
			{ name: "HTML", weight: 8, category: "core" },
			{ name: "CSS", weight: 8, category: "core" },
			{ name: "Responsive Design", weight: 7, category: "core" },
			{ name: "Web Performance", weight: 6, category: "core" },
			{ name: "Accessibility", weight: 6, category: "core" },
			{ name: "Next.js", weight: 8, category: "tool" },
			{ name: "Tailwind CSS", weight: 6, category: "tool" },
			{ name: "Git", weight: 5, category: "tool" },
			{ name: "Figma", weight: 5, category: "tool" },
			{ name: "Jest", weight: 5, category: "tool" },
			{ name: "Attention to detail", weight: 4, category: "soft" },
			{ name: "Design sense", weight: 4, category: "soft" },
			{ name: "Collaboration", weight: 3, category: "soft" },
		],
	},
	"Backend Engineer": {
		label: "Backend Engineer",
		coreSkills: [
			"REST APIs",
			"SQL",
			"System Design",
			"Authentication",
			"Database Design",
			"Performance Optimization",
			"API Design",
			"Testing",
		],
		tools: [
			"PostgreSQL",
			"MongoDB",
			"Redis",
			"Docker",
			"Git",
			"Prisma",
			"Kubernetes",
			"Kafka",
		],
		softSkills: [
			"Problem-solving",
			"Documentation",
			"Collaboration",
			"Code review",
		],
		certifications: ["AWS Developer Associate", "MongoDB Associate Developer"],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "REST APIs", weight: 10, category: "core" },
			{ name: "SQL", weight: 9, category: "core" },
			{ name: "System Design", weight: 9, category: "core" },
			{ name: "API Design", weight: 8, category: "core" },
			{ name: "Database Design", weight: 8, category: "core" },
			{ name: "Performance Optimization", weight: 7, category: "core" },
			{ name: "Authentication", weight: 7, category: "core" },
			{ name: "Testing", weight: 7, category: "core" },
			{ name: "PostgreSQL", weight: 8, category: "tool" },
			{ name: "Docker", weight: 7, category: "tool" },
			{ name: "Redis", weight: 6, category: "tool" },
			{ name: "Git", weight: 5, category: "tool" },
			{ name: "Kubernetes", weight: 5, category: "tool" },
			{ name: "MongoDB", weight: 5, category: "tool" },
			{ name: "Problem-solving", weight: 5, category: "soft" },
			{ name: "Documentation", weight: 4, category: "soft" },
			{ name: "Collaboration", weight: 3, category: "soft" },
		],
	},
	"Full-Stack Developer": {
		label: "Full-Stack Developer",
		coreSkills: [
			"JavaScript",
			"TypeScript",
			"HTML",
			"CSS",
			"React",
			"Node.js",
			"REST APIs",
			"SQL",
			"System Design Basics",
		],
		tools: [
			"Git",
			"Docker",
			"PostgreSQL",
			"MongoDB",
			"Express",
			"Next.js",
			"Redis",
		],
		softSkills: ["Collaboration", "Debugging", "Code review", "Agile delivery"],
		certifications: ["Meta Front-End Developer", "AWS Cloud Practitioner"],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "JavaScript", weight: 9, category: "core" },
			{ name: "TypeScript", weight: 8, category: "core" },
			{ name: "React", weight: 9, category: "core" },
			{ name: "Node.js", weight: 9, category: "core" },
			{ name: "REST APIs", weight: 8, category: "core" },
			{ name: "SQL", weight: 8, category: "core" },
			{ name: "HTML", weight: 7, category: "core" },
			{ name: "CSS", weight: 7, category: "core" },
			{ name: "System Design Basics", weight: 6, category: "core" },
			{ name: "PostgreSQL", weight: 7, category: "tool" },
			{ name: "Docker", weight: 6, category: "tool" },
			{ name: "Git", weight: 6, category: "tool" },
			{ name: "Next.js", weight: 6, category: "tool" },
			{ name: "Express", weight: 5, category: "tool" },
			{ name: "MongoDB", weight: 5, category: "tool" },
			{ name: "Redis", weight: 4, category: "tool" },
			{ name: "Collaboration", weight: 3, category: "soft" },
			{ name: "Debugging", weight: 4, category: "soft" },
		],
	},
	"Cloud Engineer (AWS / Azure / GCP)": {
		label: "Cloud Engineer (AWS / Azure / GCP)",
		coreSkills: [
			"Cloud Architecture",
			"Networking",
			"Linux",
			"Infrastructure as Code",
			"Security Best Practices",
			"Cost Optimization",
			"High Availability",
		],
		tools: [
			"AWS",
			"Azure",
			"GCP",
			"Terraform",
			"CloudFormation",
			"IAM",
			"VPC",
			"Kubernetes",
		],
		softSkills: [
			"Incident response",
			"Documentation",
			"Stakeholder communication",
		],
		certifications: [
			"AWS Solutions Architect",
			"Azure Administrator",
			"Google Cloud Associate Engineer",
		],
		typicalTimeline: "5-9 months",
		weightedSkills: [
			{ name: "Cloud Architecture", weight: 10, category: "core" },
			{ name: "Networking", weight: 9, category: "core" },
			{ name: "Linux", weight: 8, category: "core" },
			{ name: "Infrastructure as Code", weight: 8, category: "core" },
			{ name: "Security Best Practices", weight: 7, category: "core" },
			{ name: "High Availability", weight: 7, category: "core" },
			{ name: "Cost Optimization", weight: 6, category: "core" },
			{ name: "Terraform", weight: 8, category: "tool" },
			{ name: "AWS", weight: 8, category: "tool" },
			{ name: "Kubernetes", weight: 7, category: "tool" },
			{ name: "IAM", weight: 6, category: "tool" },
			{ name: "VPC", weight: 6, category: "tool" },
			{ name: "Incident response", weight: 4, category: "soft" },
			{ name: "Documentation", weight: 4, category: "soft" },
			{ name: "Stakeholder communication", weight: 3, category: "soft" },
		],
	},
	"DevOps / Platform Engineer": {
		label: "DevOps / Platform Engineer",
		coreSkills: [
			"CI/CD",
			"Linux",
			"Scripting",
			"Containerization",
			"Monitoring",
			"Infrastructure Automation",
			"Reliability Engineering",
		],
		tools: [
			"Docker",
			"Kubernetes",
			"Jenkins",
			"GitHub Actions",
			"Terraform",
			"Prometheus",
			"Grafana",
			"Ansible",
		],
		softSkills: [
			"Automation mindset",
			"On-call readiness",
			"Cross-team collaboration",
		],
		certifications: [
			"CKA",
			"AWS DevOps Engineer",
			"HashiCorp Terraform Associate",
		],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "CI/CD", weight: 10, category: "core" },
			{ name: "Linux", weight: 9, category: "core" },
			{ name: "Containerization", weight: 9, category: "core" },
			{ name: "Infrastructure Automation", weight: 8, category: "core" },
			{ name: "Monitoring", weight: 8, category: "core" },
			{ name: "Reliability Engineering", weight: 7, category: "core" },
			{ name: "Scripting", weight: 7, category: "core" },
			{ name: "Docker", weight: 9, category: "tool" },
			{ name: "Kubernetes", weight: 9, category: "tool" },
			{ name: "Terraform", weight: 7, category: "tool" },
			{ name: "GitHub Actions", weight: 6, category: "tool" },
			{ name: "Prometheus", weight: 6, category: "tool" },
			{ name: "Grafana", weight: 5, category: "tool" },
			{ name: "Automation mindset", weight: 4, category: "soft" },
			{ name: "On-call readiness", weight: 3, category: "soft" },
			{ name: "Cross-team collaboration", weight: 3, category: "soft" },
		],
	},
	"Data Analyst": {
		label: "Data Analyst",
		coreSkills: [
			"SQL",
			"Statistics",
			"Data Visualization",
			"Python",
			"A/B Testing",
			"Data Modeling",
			"Business Acumen",
		],
		tools: [
			"Tableau",
			"Power BI",
			"Looker",
			"Excel",
			"R",
			"Airflow",
			"Spark",
		],
		softSkills: [
			"Business acumen",
			"Storytelling with data",
			"Attention to detail",
		],
		certifications: ["Google Data Analytics", "Tableau Desktop Specialist"],
		typicalTimeline: "3-6 months",
		weightedSkills: [
			{ name: "SQL", weight: 10, category: "core" },
			{ name: "Statistics", weight: 9, category: "core" },
			{ name: "Data Visualization", weight: 8, category: "core" },
			{ name: "Python", weight: 7, category: "core" },
			{ name: "A/B Testing", weight: 7, category: "core" },
			{ name: "Data Modeling", weight: 7, category: "core" },
			{ name: "Business Acumen", weight: 6, category: "core" },
			{ name: "Tableau", weight: 7, category: "tool" },
			{ name: "Power BI", weight: 6, category: "tool" },
			{ name: "Excel", weight: 6, category: "tool" },
			{ name: "Storytelling with data", weight: 4, category: "soft" },
			{ name: "Attention to detail", weight: 3, category: "soft" },
		],
	},
	"Data Engineer": {
		label: "Data Engineer",
		coreSkills: [
			"SQL",
			"Data Modeling",
			"ETL/ELT",
			"Python",
			"Data Warehousing",
			"Apache Spark",
			"Data Pipeline",
		],
		tools: [
			"Airflow",
			"dbt",
			"Kafka",
			"Snowflake",
			"BigQuery",
			"Spark",
			"Docker",
			"Kubernetes",
		],
		softSkills: [
			"Data quality mindset",
			"Attention to detail",
			"Documentation",
		],
		certifications: [
			"Databricks Data Engineer Associate",
			"Google Professional Data Engineer",
		],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "SQL", weight: 10, category: "core" },
			{ name: "Python", weight: 9, category: "core" },
			{ name: "ETL/ELT", weight: 9, category: "core" },
			{ name: "Data Modeling", weight: 8, category: "core" },
			{ name: "Data Warehousing", weight: 8, category: "core" },
			{ name: "Apache Spark", weight: 7, category: "core" },
			{ name: "Data Pipeline", weight: 7, category: "core" },
			{ name: "Airflow", weight: 7, category: "tool" },
			{ name: "Snowflake", weight: 7, category: "tool" },
			{ name: "dbt", weight: 6, category: "tool" },
			{ name: "Kafka", weight: 6, category: "tool" },
			{ name: "Docker", weight: 5, category: "tool" },
			{ name: "BigQuery", weight: 5, category: "tool" },
			{ name: "Data quality mindset", weight: 3, category: "soft" },
		],
	},
	"Cybersecurity Specialist": {
		label: "Cybersecurity Specialist",
		coreSkills: [
			"Network Security",
			"Threat Analysis",
			"Vulnerability Assessment",
			"Incident Response",
			"Cryptography Basics",
			"Security Policies",
			"Risk Management",
		],
		tools: [
			"Wireshark",
			"Nmap",
			"SIEM",
			"Burp Suite",
			"Metasploit",
			"Splunk",
			"Kali Linux",
		],
		softSkills: ["Ethical judgment", "Attention to detail", "Clear reporting"],
		certifications: ["CompTIA Security+", "CEH", "CISSP (long-term)"],
		typicalTimeline: "6-10 months",
		weightedSkills: [
			{ name: "Network Security", weight: 10, category: "core" },
			{ name: "Threat Analysis", weight: 9, category: "core" },
			{ name: "Vulnerability Assessment", weight: 8, category: "core" },
			{ name: "Incident Response", weight: 8, category: "core" },
			{ name: "Risk Management", weight: 7, category: "core" },
			{ name: "Security Policies", weight: 7, category: "core" },
			{ name: "Cryptography Basics", weight: 6, category: "core" },
			{ name: "SIEM", weight: 7, category: "tool" },
			{ name: "Nmap", weight: 6, category: "tool" },
			{ name: "Burp Suite", weight: 6, category: "tool" },
			{ name: "Splunk", weight: 6, category: "tool" },
			{ name: "Kali Linux", weight: 5, category: "tool" },
			{ name: "Ethical judgment", weight: 4, category: "soft" },
			{ name: "Clear reporting", weight: 3, category: "soft" },
		],
	},
	"Software Engineer (Product-Based Companies)": {
		label: "Software Engineer (Product-Based Companies)",
		coreSkills: [
			"Data Structures",
			"Algorithms",
			"System Design",
			"Object-Oriented Programming",
			"Testing",
			"API Design",
			"Performance Optimization",
		],
		tools: [
			"Python",
			"Java",
			"C++",
			"Git",
			"Docker",
			"PostgreSQL",
			"Redis",
			"Kafka",
		],
		softSkills: [
			"Ownership",
			"Product thinking",
			"Communication",
			"Mentorship",
		],
		certifications: ["Not required — focus on DSA + system design + portfolio"],
		typicalTimeline: "6-12 months",
		weightedSkills: [
			{ name: "Data Structures", weight: 10, category: "core" },
			{ name: "Algorithms", weight: 10, category: "core" },
			{ name: "System Design", weight: 9, category: "core" },
			{ name: "Object-Oriented Programming", weight: 8, category: "core" },
			{ name: "Testing", weight: 7, category: "core" },
			{ name: "API Design", weight: 7, category: "core" },
			{ name: "Performance Optimization", weight: 6, category: "core" },
			{ name: "Python", weight: 7, category: "tool" },
			{ name: "Git", weight: 6, category: "tool" },
			{ name: "Docker", weight: 5, category: "tool" },
			{ name: "PostgreSQL", weight: 5, category: "tool" },
			{ name: "Ownership", weight: 4, category: "soft" },
			{ name: "Product thinking", weight: 4, category: "soft" },
			{ name: "Communication", weight: 3, category: "soft" },
		],
	},
	"Mobile Developer": {
		label: "Mobile Developer",
		coreSkills: [
			"Swift",
			"Kotlin",
			"iOS",
			"Android",
			"REST APIs",
			"Mobile Architecture",
			"App Store Deployment",
		],
		tools: [
			"SwiftUI",
			"UIKit",
			"Jetpack Compose",
			"React Native",
			"Flutter",
			"Git",
			"Firebase",
		],
		softSkills: [
			"UI/UX sensitivity",
			"Performance optimization",
			"User-centric thinking",
		],
		certifications: [
			"Meta iOS Developer",
			"Meta Android Developer",
			"Google Associate Android Developer",
		],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "Swift", weight: 9, category: "core" },
			{ name: "Kotlin", weight: 9, category: "core" },
			{ name: "iOS", weight: 8, category: "core" },
			{ name: "Android", weight: 8, category: "core" },
			{ name: "REST APIs", weight: 7, category: "core" },
			{ name: "Mobile Architecture", weight: 7, category: "core" },
			{ name: "SwiftUI", weight: 7, category: "tool" },
			{ name: "Jetpack Compose", weight: 6, category: "tool" },
			{ name: "React Native", weight: 5, category: "tool" },
			{ name: "Flutter", weight: 5, category: "tool" },
			{ name: "Git", weight: 5, category: "tool" },
			{ name: "UI/UX sensitivity", weight: 4, category: "soft" },
			{ name: "Performance optimization", weight: 4, category: "soft" },
		],
	},
	"Data Scientist": {
		label: "Data Scientist",
		coreSkills: [
			"Statistics",
			"Python",
			"SQL",
			"Machine Learning",
			"Experimental Design",
			"A/B Testing",
			"Data Visualization",
		],
		tools: [
			"R",
			"Scikit-learn",
			"TensorFlow",
			"PyTorch",
			"Spark",
			"Jupyter",
			"Pandas",
		],
		softSkills: [
			"Scientific curiosity",
			"Causal reasoning",
			"Stakeholder communication",
		],
		certifications: [
			"AWS ML Specialty",
			"Google Professional Data Scientist",
		],
		typicalTimeline: "6-12 months",
		weightedSkills: [
			{ name: "Statistics", weight: 10, category: "core" },
			{ name: "Python", weight: 9, category: "core" },
			{ name: "SQL", weight: 8, category: "core" },
			{ name: "Machine Learning", weight: 8, category: "core" },
			{ name: "Experimental Design", weight: 8, category: "core" },
			{ name: "A/B Testing", weight: 7, category: "core" },
			{ name: "Data Visualization", weight: 6, category: "core" },
			{ name: "Scikit-learn", weight: 6, category: "tool" },
			{ name: "PyTorch", weight: 5, category: "tool" },
			{ name: "Pandas", weight: 6, category: "tool" },
			{ name: "Spark", weight: 4, category: "tool" },
			{ name: "R", weight: 4, category: "tool" },
			{ name: "Scientific curiosity", weight: 4, category: "soft" },
			{ name: "Causal reasoning", weight: 4, category: "soft" },
		],
	},
	"Site Reliability Engineer (SRE)": {
		label: "Site Reliability Engineer (SRE)",
		coreSkills: [
			"Linux",
			"Scripting",
			"Monitoring",
			"Incident Response",
			"Reliability Engineering",
			"Automation",
			"Distributed Systems",
		],
		tools: [
			"Go",
			"Python",
			"Prometheus",
			"Grafana",
			"Kubernetes",
			"Docker",
			"Terraform",
		],
		softSkills: [
			"Incident response",
			"On-call readiness",
			"Calm under pressure",
		],
		certifications: [
			"Google SRE Fundamentals",
			"CKA",
			"AWS DevOps Engineer",
		],
		typicalTimeline: "6-10 months",
		weightedSkills: [
			{ name: "Linux", weight: 10, category: "core" },
			{ name: "Monitoring", weight: 9, category: "core" },
			{ name: "Incident Response", weight: 9, category: "core" },
			{ name: "Reliability Engineering", weight: 8, category: "core" },
			{ name: "Automation", weight: 8, category: "core" },
			{ name: "Distributed Systems", weight: 7, category: "core" },
			{ name: "Scripting", weight: 7, category: "core" },
			{ name: "Kubernetes", weight: 7, category: "tool" },
			{ name: "Prometheus", weight: 7, category: "tool" },
			{ name: "Grafana", weight: 6, category: "tool" },
			{ name: "Go", weight: 6, category: "tool" },
			{ name: "Python", weight: 6, category: "tool" },
			{ name: "Docker", weight: 6, category: "tool" },
			{ name: "Incident response", weight: 4, category: "soft" },
			{ name: "On-call readiness", weight: 3, category: "soft" },
		],
	},
	"UI/UX Designer": {
		label: "UI/UX Designer",
		coreSkills: [
			"User Research",
			"Wireframing",
			"Prototyping",
			"Visual Design",
			"Figma",
			"Design Systems",
			"Information Architecture",
		],
		tools: [
			"Figma",
			"Sketch",
			"Adobe XD",
			"Framer",
			"Storybook",
			"Zeroheight",
			"UsabilityHub",
		],
		softSkills: [
			"Empathy",
			"Visual storytelling",
			"Cross-functional collaboration",
		],
		certifications: [
			"Google UX Design",
			"NN/g UX Certification",
			"Interaction Design Foundation",
		],
		typicalTimeline: "3-6 months",
		weightedSkills: [
			{ name: "User Research", weight: 10, category: "core" },
			{ name: "Wireframing", weight: 9, category: "core" },
			{ name: "Prototyping", weight: 9, category: "core" },
			{ name: "Visual Design", weight: 8, category: "core" },
			{ name: "Figma", weight: 9, category: "core" },
			{ name: "Design Systems", weight: 7, category: "core" },
			{ name: "Information Architecture", weight: 7, category: "core" },
			{ name: "Interaction Design", weight: 7, category: "tool" },
			{ name: "Accessibility", weight: 6, category: "tool" },
			{ name: "User Testing", weight: 7, category: "tool" },
			{ name: "Empathy", weight: 4, category: "soft" },
			{ name: "Visual storytelling", weight: 4, category: "soft" },
			{ name: "Cross-functional collaboration", weight: 3, category: "soft" },
		],
	},
	"Product Manager": {
		label: "Product Manager",
		coreSkills: [
			"Product Strategy",
			"User Stories",
			"Roadmapping",
			"A/B Testing",
			"Metrics & Analytics",
			"Stakeholder Management",
			"Market Research",
		],
		tools: [
			"Jira",
			"Notion",
			"Linear",
			"Amplitude",
			"Mixpanel",
			"SQL",
			"Figma",
		],
		softSkills: [
			"Communication",
			"Leadership",
			"Cross-functional collaboration",
			"Decision-making",
		],
		certifications: [
			"Pragmatic Institute Certification",
			"Product School Product Manager",
		],
		typicalTimeline: "4-8 months",
		weightedSkills: [
			{ name: "Product Strategy", weight: 10, category: "core" },
			{ name: "User Stories", weight: 9, category: "core" },
			{ name: "Roadmapping", weight: 8, category: "core" },
			{ name: "Metrics & Analytics", weight: 8, category: "core" },
			{ name: "Stakeholder Management", weight: 8, category: "core" },
			{ name: "Market Research", weight: 7, category: "core" },
			{ name: "A/B Testing", weight: 7, category: "core" },
			{ name: "SQL", weight: 5, category: "tool" },
			{ name: "Jira", weight: 5, category: "tool" },
			{ name: "Amplitude", weight: 5, category: "tool" },
			{ name: "Communication", weight: 5, category: "soft" },
			{ name: "Leadership", weight: 4, category: "soft" },
			{ name: "Cross-functional collaboration", weight: 4, category: "soft" },
		],
	},
	"Forward Deployed Engineer": {
		label: "Forward Deployed Engineer",
		coreSkills: [
			"Full-Stack Development",
			"API Integration",
			"Deployment",
			"Scripting",
			"Problem Solving",
			"Client Communication",
			"SQL",
		],
		tools: [
			"Python",
			"TypeScript",
			"Docker",
			"CI/CD",
			"Terraform",
			"Monitoring",
			"Git",
		],
		softSkills: [
			"Client-facing communication",
			"Rapid prototyping",
			"Adaptability",
		],
		certifications: [
			"AWS Cloud Practitioner",
			"HashiCorp Terraform Associate",
		],
		typicalTimeline: "3-6 months",
		weightedSkills: [
			{ name: "Full-Stack Development", weight: 10, category: "core" },
			{ name: "API Integration", weight: 9, category: "core" },
			{ name: "Problem Solving", weight: 8, category: "core" },
			{ name: "Deployment", weight: 8, category: "core" },
			{ name: "Client Communication", weight: 8, category: "core" },
			{ name: "Scripting", weight: 7, category: "core" },
			{ name: "SQL", weight: 7, category: "core" },
			{ name: "Python", weight: 7, category: "tool" },
			{ name: "TypeScript", weight: 6, category: "tool" },
			{ name: "Docker", weight: 6, category: "tool" },
			{ name: "CI/CD", weight: 6, category: "tool" },
			{ name: "Client-facing communication", weight: 5, category: "soft" },
			{ name: "Rapid prototyping", weight: 4, category: "soft" },
			{ name: "Adaptability", weight: 4, category: "soft" },
		],
	},
};

const FRESHER_BOOST = ["SQL", "Git", "JavaScript", "TypeScript", "HTML", "CSS", "Python", "Java", "Testing", "Communication", "Data Structures", "Algorithms", "Object-Oriented Programming", "REST APIs", "Linux"];
const SENIOR_BOOST = ["System Design", "Distributed Systems", "Architecture", "Leadership", "Mentoring", "Performance Optimization", "Incident Response", "Reliability Engineering", "Product Strategy", "Stakeholder Management", "Team Management", "Cross-functional", "Mentorship", "Ownership"];

export function getProfileForLevel(profile: CareerGoalProfile, level: ExperienceLevel): CareerGoalProfile {
	const adjusted = { ...profile, weightedSkills: [...profile.weightedSkills] };
	for (const ws of adjusted.weightedSkills) {
		if (level === "fresher" && FRESHER_BOOST.some((f) => ws.name.toLowerCase().includes(f.toLowerCase()))) {
			ws.weight = Math.min(10, ws.weight + 2);
		}
		if (level === "senior" && SENIOR_BOOST.some((f) => ws.name.toLowerCase().includes(f.toLowerCase()))) {
			ws.weight = Math.min(10, ws.weight + 3);
		}
	}
	if (level === "fresher" && profile.fresherSkills) {
		const existing = new Set(adjusted.weightedSkills.map((s) => s.name));
		for (const skill of profile.fresherSkills) {
			if (!existing.has(skill)) {
				adjusted.coreSkills.push(skill);
				adjusted.weightedSkills.push({ name: skill, weight: 8, category: "core" });
			}
		}
	}
	if (level === "senior" && profile.seniorSkills) {
		const existing = new Set(adjusted.weightedSkills.map((s) => s.name));
		for (const skill of profile.seniorSkills) {
			if (!existing.has(skill)) {
				adjusted.coreSkills.push(skill);
				adjusted.weightedSkills.push({ name: skill, weight: 9, category: "core" });
			}
		}
	}
	return adjusted;
}

function parseDurationYears(duration: string): number {
	const lower = duration.toLowerCase();
	const monthMatch = lower.match(/(\d+)\s*months?/);
	if (monthMatch) return parseInt(monthMatch[1]) / 12;
	const yearMatch = lower.match(/(\d+)\s*years?/);
	if (yearMatch) return parseInt(yearMatch[1]);
	const singleNum = lower.match(/(\d+)/);
	if (!singleNum) return 0;
	const val = parseInt(singleNum[0]);
	if (val > 100) return 0;
	return val;
}

export function inferExperienceLevel(experience?: { role: string; company: string; duration: string }[]): ExperienceLevel {
	if (!experience || experience.length === 0) return "fresher";
	const totalYears = experience.reduce((acc, exp) => acc + parseDurationYears(exp.duration), 0);
	if (totalYears <= 1) return "fresher";
	if (totalYears <= 5) return "mid";
	return "senior";
}

function normalizeSkill(skill: string): string {
	return skill.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function skillMatches(userSkills: string[], target: string): boolean {
	const normalizedTarget = normalizeSkill(target);
	return userSkills.some((skill) => {
		const normalized = normalizeSkill(skill);
		return normalized === normalizedTarget;
	});
}

export function getCareerProfile(careerGoal: string, level?: ExperienceLevel): CareerGoalProfile {
	const match = CAREER_GOALS.find((g) => g === careerGoal);
	const base = match ? CAREER_GOAL_PROFILES[match] : CAREER_GOAL_PROFILES["Full-Stack Developer"];
	return level ? getProfileForLevel(base, level) : base;
}

export function categorizeSkillsForGoal(
	userSkills: string[],
	careerGoal: string,
	level?: ExperienceLevel,
	customWeights?: { weightedSkills: WeightedSkill[]; coreSkills: string[]; tools: string[] },
	repoSkills?: Set<string>,
	seniorityPostingSkillsRaw?: Set<string>,
): {
	profile: CareerGoalProfile;
	strong: string[];
	improving: string[];
	weak: string[];
	gapPriority: Record<string, "now" | "later">;
	skillCategories: { core: { matched: string[]; missing: string[] }; tools: { matched: string[]; missing: string[] }; soft: { matched: string[]; missing: string[] } };
} {
	userSkills = resolveAliases(userSkills);
	const profile = customWeights
		? { ...getCareerProfile(careerGoal, level), weightedSkills: customWeights.weightedSkills, coreSkills: customWeights.coreSkills, tools: customWeights.tools }
		: getCareerProfile(careerGoal, level);

	const marketSkills = getSeniorityPostingSkills(seniorityPostingSkillsRaw);

	const strong: string[] = [];
	const improving: string[] = [];
	const weak: string[] = [];

	for (const ws of profile.weightedSkills) {
		const hasSkill = skillMatches(userSkills, ws.name);
		const hasRepoEvidence = repoSkills?.has(ws.name);

		if (hasRepoEvidence) {
			strong.push(ws.name);
		} else if (hasSkill) {
			improving.push(ws.name);
		} else {
			weak.push(ws.name);
		}
	}

	// Sort weak: market-relevant skills first
	if (marketSkills && marketSkills.size > 0) {
		weak.sort((a, b) => {
			const aInMarket = marketSkills.has(a) ? 0 : 1;
			const bInMarket = marketSkills.has(b) ? 0 : 1;
			return aInMarket - bInMarket;
		});
	}

	const matchedSoft = profile.softSkills.filter((s) =>
		userSkills.some((us) =>
			normalizeSkill(us) === normalizeSkill(s),
		),
	);

	const gapPriority = computeGapPriority(
		[...new Set(weak)],
		profile.weightedSkills,
		marketSkills,
	);

	return {
		profile,
		strong: [...new Set(strong)],
		improving: [...new Set(improving)].slice(0, 6),
		weak: [...new Set(weak)],
		gapPriority,
		skillCategories: {
			core: {
				matched: profile.coreSkills.filter((s) => skillMatches(userSkills, s)),
				missing: profile.coreSkills.filter((s) => !skillMatches(userSkills, s)),
			},
			tools: {
				matched: profile.tools.filter((s) => skillMatches(userSkills, s)),
				missing: profile.tools.filter((s) => !skillMatches(userSkills, s)),
			},
			soft: {
				matched: matchedSoft,
				missing: profile.softSkills.filter((s) => !matchedSoft.includes(s)),
			},
		},
	};
}

export function computeMatchScore(userSkills: string[], careerGoal: string, level?: ExperienceLevel, customWeights?: WeightedSkill[]) {
	userSkills = resolveAliases(userSkills);
	const profile = getCareerProfile(careerGoal, level);
	const weighted = customWeights || profile.weightedSkills;

	let earnedWeight = 0;
	let totalWeight = 0;

	for (const ws of weighted) {
		totalWeight += ws.weight;
		if (skillMatches(userSkills, ws.name)) {
			earnedWeight += ws.weight;
		}
	}

	const matchScore = Math.max(
		25,
		Math.min(
			95,
			Math.round((earnedWeight / Math.max(totalWeight, 1)) * 100),
		),
	);

	const matchedCore = profile.coreSkills.filter((s) =>
		skillMatches(userSkills, s),
	);
	const matchedTools = profile.tools.filter((s) => skillMatches(userSkills, s));

	return {
		matchScore,
		breakdown: {
			matchedCore,
			matchedTools,
			weightedScore: matchScore,
			earnedWeight,
			totalWeight,
		},
	};
}

export async function deriveProfileFromMarket(
	careerGoal: string,
): Promise<MarketDerivedProfile | null> {
	try {
		const postings = await retrieveJobPostings(careerGoal, 10);
		if (!postings || postings.length === 0) return null;

		const skillFrequency = new Map<string, { count: number; category: "core" | "tool" | "soft" }>();
		const companies = new Set<string>();

		for (const posting of postings) {
			if (posting.metadata.company) companies.add(posting.metadata.company);
			for (const skill of posting.metadata.requiredSkills || []) {
				const existing = skillFrequency.get(skill) || { count: 0, category: "core" as const };
				existing.count++;
				skillFrequency.set(skill, existing);
			}
			for (const skill of posting.metadata.niceToHaveSkills || []) {
				const existing = skillFrequency.get(skill) || { count: 0, category: "tool" as const };
				existing.count++;
				if (existing.category !== "core") existing.category = "tool";
				skillFrequency.set(skill, existing);
			}
		}

		const maxFreq = Math.max(...Array.from(skillFrequency.values()).map((s) => s.count), 1);
		const weightedSkills: WeightedSkill[] = Array.from(skillFrequency.entries())
			.map(([name, info]) => ({
				name,
				weight: Math.max(1, Math.round((info.count / maxFreq) * 10)),
				category: info.category,
			}))
			.sort((a, b) => b.weight - a.weight)
			.slice(0, 20);

		return {
			label: careerGoal,
			weightedSkills,
			topCompanies: Array.from(companies).slice(0, 10),
			source: "market",
		};
	} catch {
		return null;
	}
}
