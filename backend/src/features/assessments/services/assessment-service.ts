import { prisma } from "@/database";
import type { SubmitAssessmentResponse } from "../types/assessment.types";

export async function submitAssessment(
	userId: string,
	assessmentId: string,
	answers: string[],
): Promise<SubmitAssessmentResponse> {
	const assessment = await prisma.assessment.findFirst({
		where: { id: assessmentId, userId },
	});

	if (!assessment) throw new Error("Assessment not found");

	const questions = assessment.questions as { answer: string }[];
	let correctCount = 0;
	questions.forEach((q, index) => {
		if (answers[index] === q.answer) correctCount++;
	});

	const score = Math.round((correctCount / questions.length) * 100);

	await prisma.assessment.update({
		where: { id: assessmentId },
		data: { answers, score },
	});

	const weakSkills =
		(await prisma.skillGap.findFirst({ where: { userId } }))?.weak || [];

	const suggestions =
		score < 80
			? `Focus on strengthening: ${weakSkills.slice(0, 3).join(", ")}. Review the learning roadmap on your dashboard.`
			: "Great job! You're on track. Consider tackling advanced topics in your roadmap.";

	return {
		score,
		correctCount,
		totalQuestions: questions.length,
		suggestions,
	};
}
