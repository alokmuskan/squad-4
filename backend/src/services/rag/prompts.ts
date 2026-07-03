export function buildRagResumePrompt(
	careerGoal: string,
	jobContext: string[],
): string {
	const jobReqs = jobContext.length
		? `\n\nRelevant role context from job requirements:\n${jobContext.join("\n---\n")}`
		: "";

	return `You are an expert AI Resume Analyzer and ATS specialist.${jobReqs}

Analyze the uploaded resume for a candidate targeting: "${careerGoal}".

Extract ALL technical skills, soft skills, experience, and education.
Evaluate resume quality, ATS compatibility, and fit for the target role.

Respond strictly with a JSON object:
{
  "skills": ["Technical skill 1", ...],
  "softSkills": ["Communication", ...],
  "experience": [{"role": "Role Title", "company": "Company", "duration": "Jan 2023 - Present"}],
  "education": [{"degree": "Degree", "school": "School", "year": "2024"}],
  "summary": "2-3 sentence professional summary",
  "resumeScore": 65,
  "strengths": ["Strength 1", ...],
  "improvements": ["Improvement 1", ...],
  "atsTips": ["ATS tip 1", ...],
  "careerFit": {
    "score": 58,
    "summary": "How well this resume aligns with ${careerGoal}"
  }
}`;
}

export function buildRagSkillGapPrompt(
	careerGoal: string,
	skills: string[],
	jobContext: string[],
): string {
	const jobReqs = jobContext.length
		? `\n\nRole expectations:\n${jobContext.join("\n")}`
		: "";

	return `You are an expert AI Skill Gap Analyzer and Career Coach.${jobReqs}

Compare the candidate's skills against "${careerGoal}".

Candidate skills: ${skills.join(", ")}

Categorize each skill as strong (proficient/matches role), improving (partial exposure), or weak (missing/critical gap).

Respond strictly with a JSON object:
{
  "matchScore": 75,
  "strong": ["Skill1", ...],
  "improving": ["Skill2", ...],
  "weak": ["Skill3", ...],
  "priorityGaps": [{"skill": "Kubernetes", "importance": "high", "reason": "Core requirement"}],
  "skillCategories": {
    "core": {"matched": ["..."], "missing": ["..."]},
    "tools": {"matched": ["..."], "missing": ["..."]},
    "soft": {"matched": ["..."], "missing": ["..."]}
  },
  "roadmap": [{"step": "Phase title", "details": "Specific actions", "duration": "2-3 weeks"}],
  "coach": "Personalized coaching paragraph",
  "timeToGoal": "6-12 months",
  "recommendedCertifications": ["Cert 1", ...],
  "projectIdeas": ["Idea 1", ...]
}`;
}

