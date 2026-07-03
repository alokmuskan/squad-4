import { callAI } from "@/services/ai-service";
import { CAREER_GOAL_PROFILES } from "@/features/skill-gap-analysis/services/career-goals-service";

export interface GeneratedJobPosting {
	title: string;
	company: string;
	seniority: "junior" | "mid" | "senior";
	requiredSkills: string[];
	niceToHaveSkills: string[];
	location: string;
}

const CAREER_FREQUENCY_GUIDE: Record<string, {
	alwaysInclude: string[];
	highFrequency: string[];
	mediumFrequency: string[];
	juniorFocus: string[];
	seniorFocus: string[];
}> = {
	"Software Engineer (Product-Based Companies)": {
		alwaysInclude: ["Data Structures", "Algorithms"],
		highFrequency: ["System Design", "Object-Oriented Programming", "SQL"],
		mediumFrequency: ["Python", "Java", "C++", "API Design", "Testing", "Distributed Systems", "Git"],
		juniorFocus: ["Data Structures", "Algorithms", "Object-Oriented Programming", "Python", "Java", "Git"],
		seniorFocus: ["System Design", "Distributed Systems", "Performance Optimization", "API Design", "Microservices"],
	},
	"Frontend Engineer": {
		alwaysInclude: ["JavaScript", "TypeScript", "React"],
		highFrequency: ["CSS", "HTML", "Web Performance"],
		mediumFrequency: ["Next.js", "Responsive Design", "Testing", "Git", "State Management"],
		juniorFocus: ["JavaScript", "React", "TypeScript", "CSS", "HTML", "Git"],
		seniorFocus: ["Web Performance", "System Design", "Accessibility", "Build Tools", "Architecture"],
	},
	"Backend Engineer": {
		alwaysInclude: ["REST APIs", "SQL", "System Design"],
		highFrequency: ["Python", "Java", "Node.js", "Database Design"],
		mediumFrequency: ["API Design", "Testing", "Git", "Docker", "Performance Optimization", "Distributed Systems"],
		juniorFocus: ["REST APIs", "SQL", "Python", "Java", "Testing", "Git", "System Design Basics"],
		seniorFocus: ["System Design", "Distributed Systems", "Kubernetes", "Microservices", "Performance Optimization", "Kafka"],
	},
	"Full-Stack Developer": {
		alwaysInclude: ["JavaScript", "TypeScript", "React", "Node.js"],
		highFrequency: ["SQL", "REST APIs", "Git", "PostgreSQL"],
		mediumFrequency: ["CSS", "HTML", "Testing", "System Design Basics", "Docker", "MongoDB"],
		juniorFocus: ["JavaScript", "React", "Node.js", "TypeScript", "Git", "SQL", "HTML/CSS"],
		seniorFocus: ["System Design", "Docker", "Performance Optimization", "Architecture", "Microservices"],
	},
	"Data Scientist": {
		alwaysInclude: ["Python", "Machine Learning", "Statistics"],
		highFrequency: ["SQL", "Deep Learning", "Data Visualization", "TensorFlow", "PyTorch"],
		mediumFrequency: ["Feature Engineering", "NLP", "Scikit-learn", "Pandas", "A/B Testing", "Model Evaluation"],
		juniorFocus: ["Python", "Statistics", "SQL", "Machine Learning", "Pandas", "Data Visualization"],
		seniorFocus: ["MLOps", "Deep Learning", "Distributed Training", "MLflow", "Kubernetes", "Research"],
	},
	"Data Analyst": {
		alwaysInclude: ["SQL", "Statistics", "Data Visualization"],
		highFrequency: ["Python", "Excel", "Business Acumen"],
		mediumFrequency: ["Tableau", "Power BI", "A/B Testing", "Communication", "R"],
		juniorFocus: ["SQL", "Excel", "Statistics", "Data Visualization", "Python Basics", "Business Acumen"],
		seniorFocus: ["Experimental Design", "Advanced Statistics", "Stakeholder Management", "Data Strategy"],
	},
	"Data Engineer": {
		alwaysInclude: ["Python", "SQL", "ETL", "Data Pipelines"],
		highFrequency: ["Spark", "Kafka", "AWS", "Data Warehousing"],
		mediumFrequency: ["Airflow", "Docker", "Kubernetes", "Git", "Database Design"],
		juniorFocus: ["Python", "SQL", "ETL", "Data Pipelines", "Git", "Database Design"],
		seniorFocus: ["Spark", "Kafka", "Distributed Systems", "Architecture", "Data Modeling", "Kubernetes"],
	},
	"AI / Machine Learning Engineer": {
		alwaysInclude: ["Python", "Machine Learning", "Deep Learning"],
		highFrequency: ["TensorFlow", "PyTorch", "SQL", "Statistics", "MLOps"],
		mediumFrequency: ["CUDA", "Docker", "Kubernetes", "MLflow", "NLP", "Computer Vision", "Spark"],
		juniorFocus: ["Python", "Machine Learning", "Deep Learning", "Statistics", "SQL", "Pandas", "NumPy"],
		seniorFocus: ["MLOps", "Kubernetes", "Distributed Systems", "System Design", "Model Optimization", "Research"],
	},
	"Cloud Engineer (AWS / Azure / GCP)": {
		alwaysInclude: ["AWS", "Cloud Architecture", "Infrastructure as Code", "Terraform"],
		highFrequency: ["Linux", "Networking", "Security Best Practices", "CI/CD"],
		mediumFrequency: ["Kubernetes", "Docker", "Python", "Monitoring", "Cost Optimization"],
		juniorFocus: ["Linux", "Networking", "Cloud Basics", "Infrastructure as Code", "Security Basics", "Terraform"],
		seniorFocus: ["Cloud Architecture", "Security Best Practices", "Multi-Cloud", "Cost Optimization", "Solution Design"],
	},
	"DevOps / Platform Engineer": {
		alwaysInclude: ["CI/CD", "Docker", "Kubernetes", "Linux"],
		highFrequency: ["Terraform", "Scripting", "Monitoring", "Git"],
		mediumFrequency: ["Prometheus", "Grafana", "Python", "Go", "Helm", "Ansible"],
		juniorFocus: ["Linux", "Docker", "CI/CD", "Git", "Scripting", "Basic Monitoring"],
		seniorFocus: ["Kubernetes", "Microservices", "Service Mesh", "Platform Architecture", "Reliability Engineering"],
	},
	"Mobile Developer": {
		alwaysInclude: ["Swift", "Kotlin", "iOS", "Android"],
		highFrequency: ["REST APIs", "Mobile Architecture", "Git", "UI/UX"],
		mediumFrequency: ["SwiftUI", "Jetpack Compose", "React Native", "Flutter", "Firebase", "Testing"],
		juniorFocus: ["Swift", "Kotlin", "Android", "iOS", "Git", "Mobile Architecture Basics"],
		seniorFocus: ["Mobile Architecture", "System Design", "Performance Optimization", "CI/CD", "Mentoring"],
	},
	"Cybersecurity Specialist": {
		alwaysInclude: ["Network Security", "Security Best Practices", "Linux"],
		highFrequency: ["Vulnerability Assessment", "Penetration Testing", "Python", "Cloud Security"],
		mediumFrequency: ["SIEM", "Incident Response", "Risk Management", "Firewalls", "Encryption"],
		juniorFocus: ["Network Security", "Linux", "Python", "Vulnerability Assessment", "Security Basics"],
		seniorFocus: ["Security Architecture", "Incident Response", "Risk Management", "Compliance", "Threat Modeling"],
	},
	"Site Reliability Engineer (SRE)": {
		alwaysInclude: ["Linux", "Monitoring", "Incident Response", "Automation"],
		highFrequency: ["Kubernetes", "Docker", "Scripting", "Python", "Distributed Systems"],
		mediumFrequency: ["Go", "Terraform", "Prometheus", "Grafana", "CI/CD", "Reliability Engineering"],
		juniorFocus: ["Linux", "Monitoring", "Scripting", "Python", "Incident Response", "Docker"],
		seniorFocus: ["Distributed Systems", "SRE", "Capacity Planning", "Service Level Objectives", "Architecture"],
	},
	"UI/UX Designer": {
		alwaysInclude: ["Figma", "User Research", "Wireframing", "Prototyping"],
		highFrequency: ["Design Systems", "Interaction Design", "Visual Design", "Usability Testing"],
		mediumFrequency: ["User Flows", "Information Architecture", "Design Thinking", "HTML/CSS", "Accessibility"],
		juniorFocus: ["Figma", "User Research", "Wireframing", "Prototyping", "Visual Design", "Design Systems"],
		seniorFocus: ["Design Strategy", "Product Thinking", "UX Leadership", "Design Operations", "Mentoring"],
	},
	"Product Manager": {
		alwaysInclude: ["Product Strategy", "User Research", "A/B Testing", "Data Analysis"],
		highFrequency: ["Roadmapping", "Stakeholder Management", "Agile", "Market Analysis"],
		mediumFrequency: ["SQL", "Wireframing", "Competitive Analysis", "Communication", "Product Metrics"],
		juniorFocus: ["User Research", "Data Analysis", "A/B Testing", "Agile", "Communication", "Product Strategy"],
		seniorFocus: ["Product Strategy", "Leadership", "Stakeholder Management", "Revenue Strategy", "Team Mentoring"],
	},
	"Forward Deployed Engineer": {
		alwaysInclude: ["Python", "SQL", "System Design", "Client Management"],
		highFrequency: ["API Design", "REST APIs", "Cloud Platforms", "Data Engineering"],
		mediumFrequency: ["Java", "TypeScript", "React", "DevOps", "Communication", "Problem Solving"],
		juniorFocus: ["Python", "SQL", "API Design", "REST APIs", "Communication", "Java"],
		seniorFocus: ["System Design", "Cloud Platforms", "Client Management", "Architecture", "Data Engineering"],
	},
};

export async function generateJobPostingsForGoal(
	careerGoal: string,
	count = 30,
): Promise<GeneratedJobPosting[]> {
	const guide = CAREER_FREQUENCY_GUIDE[careerGoal];
	const alwaysStr = guide
		? `\nCRITICAL — Each posting MUST include at least 2 skills from this list: ${guide.alwaysInclude.join(", ")}`
		: "";
	const freqStr = guide
		? `\nHigh priority skills (include in 60%+ of postings): ${guide.highFrequency.join(", ")}`
		: "";
	const medStr = guide
		? `\nMedium priority (include in ~40% of postings): ${guide.mediumFrequency.join(", ")}`
		: "";
	const juniorStr = guide
		? `\n\nFor JUNIOR postings (0-2yr) FOCUS on: ${guide.juniorFocus.join(", ")} — keep fundamental, skip advanced topics`
		: "";
	const seniorStr = guide
		? `\nFor SENIOR postings (7+yr) FOCUS on: ${guide.seniorFocus.join(", ")} — expect advanced/deep expertise`
		: "";

	const prompt = `You are a job market data analyst for India in 2026.

Generate ${count} realistic, diverse job postings for "${careerGoal}" roles in India (2026).
Cover a mix of:
- Seniority levels: junior (fresher/0-2yr), mid (3-6yr), senior (7+yr) — ~10 each
- Company types: FAANG (Google, Microsoft, Amazon India), Indian unicorns (Flipkart, Swiggy, Razorpay, Zerodha, CRED, Groww, Zomato, Ola), product startups, service-based (TCS, Infosys, Wipro)
- Locations: Bengaluru, Hyderabad, Mumbai, Pune, Gurugram, Chennai, Noida, Remote${alwaysStr}${freqStr}${medStr}${juniorStr}${seniorStr}

Each posting must have:
- Required skills (4-8 skills) — MUST match the seniority level (juniors get fundamentals, seniors get advanced)
- Nice-to-have skills (2-4 skills) — differentiating skills, NOT core requirements
- Realistic title (e.g. "SDE II at Flipkart", "Junior Software Engineer at Razorpay")
- Location

IMPORTANT: Skills MUST reflect what Indian companies actually ask for in 2026, not generic tech trends.

Respond strictly with a JSON object containing a "postings" key:
{
  "postings": [
  {
    "title": "SDE II at Flipkart",
    "company": "Flipkart",
    "seniority": "mid",
    "requiredSkills": ["Data Structures", "Algorithms", "Java", "System Design", "SQL", "Distributed Systems", "API Design"],
    "niceToHaveSkills": ["Kafka", "Docker", "Redis"],
    "location": "Bengaluru"
  },
  ...
  ]
}`;

	const raw = await callAI(prompt);
	if (!raw) return [];

	let arr: Record<string, unknown>[] = [];
	if (Array.isArray(raw)) {
		arr = raw;
	} else if (typeof raw === "object" && raw !== null) {
		const obj = raw as Record<string, unknown>;
		const possibleKeys = ["postings", "jobPostings", "jobs", "data", "results", "items"];
		for (const key of possibleKeys) {
			if (Array.isArray(obj[key])) {
				arr = obj[key] as Record<string, unknown>[];
				break;
			}
		}
	}
	return arr.slice(0, count).map((p) => ({
		title: String(p.title || ""),
		company: String(p.company || "Unknown"),
		seniority: (p.seniority || "mid") as "junior" | "mid" | "senior",
		requiredSkills: Array.isArray(p.requiredSkills)
			? p.requiredSkills.map(String)
			: [],
		niceToHaveSkills: Array.isArray(p.niceToHaveSkills)
			? p.niceToHaveSkills.map(String)
			: [],
		location: String(p.location || "Remote"),
	}));
}
