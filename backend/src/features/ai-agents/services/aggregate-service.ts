import type { AgentState } from "@/features/ai-agents/types/agent.types";

export async function aggregateProfileNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	const skills = new Set<string>();
	const seenExp = new Set<string>();
	const experience: { role: string; company: string; duration: string }[] = [];
	const seenEdu = new Set<string>();
	const education: { degree: string; school: string; year: string }[] = [];

	if (state.resumeResult) {
		for (const skill of state.resumeResult.skills) {
			skills.add(skill);
		}
		for (const s of state.resumeResult.softSkills) {
			skills.add(s);
		}
		if (state.resumeResult.experience) {
			for (const exp of state.resumeResult.experience) {
				const key = `${exp.role}|${exp.company}|${exp.duration}`;
				if (!seenExp.has(key)) {
					seenExp.add(key);
					experience.push(exp);
				}
			}
		}
		if (state.resumeResult.education) {
			for (const edu of state.resumeResult.education) {
				const key = `${edu.degree}|${edu.school}|${edu.year}`;
				if (!seenEdu.has(key)) {
					seenEdu.add(key);
					education.push(edu);
				}
			}
		}
	}

	if (state.githubResult?.repoSkills) {
		for (const skill of state.githubResult.repoSkills) {
			skills.add(skill);
		}
	}

	return {
		aggregatedSkills: [...skills],
		aggregatedExperience: experience,
		aggregatedEducation: education,
	};
}
