import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  careerGoal: z.string().min(1, "Career goal is required"),
  file: z.instanceof(File, { message: "Resume file is required" }),
});

export type ResumeAnalysisForm = z.infer<typeof resumeAnalysisSchema>;
