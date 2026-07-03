import { z } from "zod";

export const submitAssessmentSchema = z.object({
	assessmentId: z.string().min(1, "assessmentId is required"),
	answers: z.array(z.string()).min(1, "answers are required"),
});

