import {
	categorizeSkillsForGoal,
	computeMatchScore,
	getCareerProfile,
} from "./career-goals-service";

interface GitHubRepo {
	language?: string | null;
	name: string;
	description?: string | null;
	fullName?: string;
	stargazersCount?: number;
	starsCount?: number;
}

const LANGUAGE_SKILL_MAP: Record<string, string[]> = {
	JavaScript: ["JavaScript", "React", "Node.js"],
	TypeScript: ["TypeScript", "JavaScript", "React", "Node.js"],
	Python: ["Python"],
	Java: ["Java"],
	Go: ["Go"],
	Rust: ["Rust"],
	Ruby: ["Ruby"],
	PHP: ["PHP"],
	"C++": ["C++"],
	C: ["C"],
	Shell: ["Linux", "Scripting"],
	Dockerfile: ["Docker", "Containerization"],
	HCL: ["Terraform", "Infrastructure as Code"],
	Swift: ["Swift"],
	Kotlin: ["Kotlin"],
	Scala: ["Scala"],
	R: ["Statistics", "Data Visualization"],
	Jupyter: ["Python", "Jupyter"],
};

const REPO_KEYWORD_SKILLS: [string, string][] = [
	["security", "Network Security"],
	["cyber", "Threat Analysis"],
	["infosec", "Threat Analysis"],
	["pentest", "Vulnerability Assessment"],
	["vulnerability", "Vulnerability Assessment"],
	["incident", "Incident Response"],
	["cryptograph", "Cryptography Basics"],
	["nmap", "Nmap"],
	["wireshark", "Wireshark"],
	["siem", "SIEM"],
	["splunk", "Splunk"],
	["burp", "Burp Suite"],
	["metasploit", "Metasploit"],
	["kali", "Kali Linux"],
	["react", "React"],
	["nextjs", "Next.js"],
	["next.js", "Next.js"],
	["tailwind", "Tailwind CSS"],
	["docker", "Docker"],
	["kubernetes", "Kubernetes"],
	["k8s", "Kubernetes"],
	["terraform", "Terraform"],
	["aws", "AWS"],
	["azure", "Azure"],
	["gcp", "GCP"],
	["postgres", "PostgreSQL"],
	["mongodb", "MongoDB"],
	["redis", "Redis"],
	["graphql", "GraphQL"],
	["kafka", "Kafka"],
	["machine-learning", "Machine Learning"],
	["deep-learning", "Deep Learning"],
	["tensorflow", "TensorFlow"],
	["pytorch", "PyTorch"],
	["scikit", "Scikit-learn"],
	["mlflow", "MLflow"],
	["devops", "CI/CD"],
	["ci/cd", "CI/CD"],
	["prometheus", "Prometheus"],
	["grafana", "Grafana"],
	["ansible", "Ansible"],
	["spark", "Spark"],
	["airflow", "Airflow"],
	["etl", "ETL/ELT"],
	["tableau", "Tableau"],
	["power-bi", "Power BI"],
	["api", "REST APIs"],
	["microservice", "Microservices"],
	["oauth", "Authentication"],
	["jwt", "Authentication"],
];

export function extractSkillsFromRepos(repos: GitHubRepo[]): string[] {
	const skills = new Set<string>();

	for (const repo of repos) {
		if (repo.language) {
			skills.add(repo.language);
			for (const mapped of LANGUAGE_SKILL_MAP[repo.language] || []) {
				skills.add(mapped);
			}
		}

		const text =
			`${repo.name} ${repo.description || ""} ${repo.fullName || ""}`.toLowerCase();
		for (const [keyword, skill] of REPO_KEYWORD_SKILLS) {
			if (text.includes(keyword)) skills.add(skill);
		}
	}

	if (repos.length > 0) skills.add("Git");
	return Array.from(skills);
}

function buildLanguageBreakdown(repos: GitHubRepo[]) {
	const languageCounts: Record<string, number> = {};
	const totalRepos = repos.length;

	repos.forEach((repo) => {
		const lang = repo.language || "Unknown";
		languageCounts[lang] = (languageCounts[lang] || 0) + 1;
	});

	const languages = Object.entries(languageCounts)
		.map(([name, count]) => ({
			name,
			count,
			percentage: totalRepos > 0 ? Math.round((count / totalRepos) * 100) : 0,
		}))
		.sort((a, b) => b.count - a.count);

	return { languages, mostUsedLanguage: languages[0]?.name || "None" };
}

export function computeGithubStats(repos: GitHubRepo[], careerGoal: string) {
	const profile = getCareerProfile(careerGoal);
	const repoSkills = extractSkillsFromRepos(repos);
	const { weak, skillCategories } = categorizeSkillsForGoal(
		repoSkills,
		careerGoal,
	);
	const { matchScore, breakdown } = computeMatchScore(repoSkills, careerGoal);
	const { languages, mostUsedLanguage } = buildLanguageBreakdown(repos);

	const totalStars = repos.reduce(
		(acc, repo) => acc + (repo.starsCount || 0),
		0,
	);
	const activityBonus = Math.min(
		10,
		Math.floor(repos.length / 2) + Math.min(5, Math.floor(totalStars / 10)),
	);
	const score =
		repos.length === 0 ? 0 : Math.min(98, matchScore + activityBonus);

	const missingSkills = [
		...skillCategories.core.missing,
		...skillCategories.tools.missing,
	]
		.filter((skill, index, arr) => arr.indexOf(skill) === index)
		.slice(0, 5);

	const matchedSkills = [
		...breakdown.matchedCore,
		...breakdown.matchedTools,
	].slice(0, 5);

	let recommendations: string;
	if (repos.length === 0) {
		recommendations = `Sync your GitHub profile and add repos that demonstrate ${profile.coreSkills.slice(0, 2).join(" and ")} for ${careerGoal}.`;
	} else if (missingSkills.length === 0) {
		recommendations = `Strong GitHub alignment with ${careerGoal}. Your repos reflect ${matchedSkills.join(", ") || "relevant skills"}.`;
	} else {
		const gapText = missingSkills.slice(0, 3).join(", ");
		const strengthText = matchedSkills.length
			? ` You already show ${matchedSkills.slice(0, 2).join(" and ")} in your repositories.`
			: "";
		recommendations = `For ${careerGoal}, build projects covering ${gapText} to improve your GitHub readiness.${strengthText}`;
	}

	return {
		totalRepositories: repos.length,
		totalStars,
		mostUsedLanguage,
		score,
		missingSkills,
		matchedSkills,
		repoSkills,
		languages,
		recommendations,
		careerGoal,
	};
}
