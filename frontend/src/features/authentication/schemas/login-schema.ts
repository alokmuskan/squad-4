import { z } from "zod";

export const githubUsernameSchema = z.object({
  githubUsername: z
    .string()
    .min(1, "GitHub username is required")
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format"),
});

export type GithubUsernameForm = z.infer<typeof githubUsernameSchema>;
