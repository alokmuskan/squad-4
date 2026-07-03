export function validateResumePdf(
	file: string,
	mimeType?: string,
	fileName?: string,
): string | null {
	if (!file) {
		return "No file provided";
	}

	if (mimeType && !mimeType.includes("pdf") && !mimeType.includes("text")) {
		return "Only PDF and text files are supported";
	}

	if (fileName && !fileName.endsWith(".pdf") && !fileName.endsWith(".txt")) {
		return "Only .pdf and .txt files are supported";
	}

	const maxSize = 15 * 1024 * 1024; // 15MB
	const size = Buffer.byteLength(file, "base64");
	if (size > maxSize) {
		return "File size exceeds 15MB limit";
	}

	return null;
}

export function extractSkillGapDetails(
	result: Record<string, unknown>,
): Record<string, unknown> | null {
	if (!result) return null;

	return {
		priorityGaps: (result.priorityGaps as Record<string, unknown>[]) || [],
		skillCategories: (result.skillCategories as Record<string, unknown>) || {},
		gapPriority: (result.gapPriority as Record<string, string>) || {},
		timeToGoal: (result.timeToGoal as string) || "",
		recommendedCertifications:
			(result.recommendedCertifications as string[]) || [],
		projectIdeas: (result.projectIdeas as string[]) || [],
	};
}
