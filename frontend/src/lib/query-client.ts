import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  profile: ["user", "profile"] as const,
  dashboard: ["user", "dashboard"] as const,
  skillGap: ["skill-gap", "latest"] as const,
  careerGoals: ["skill-gap", "career-goals"] as const,
  jobMatches: (goal: string) => ["skill-gap", "job-matches", goal] as const,
  progressHistory: ["skill-gap", "progress"] as const,
  githubAnalysis: ["github", "analysis"] as const,
  resources: ["recommendations"] as const,
  resourceSnapshot: ["recommendations", "snapshot"] as const,
  chatSessions: ["chatbot", "sessions"] as const,
  chatMessages: (sessionId: string) => ["chatbot", "messages", sessionId] as const,
  roadmaps: ["roadmap", "list"] as const,
  roadmapDetail: (id: string) => ["roadmap", "detail", id] as const,
};
