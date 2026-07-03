import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/query-client";
import {
  bookmarkResource,
  getDashboardData,
  getGithubAnalysis,
  getJobMatches,
  getLatestSkillGap,
  getProgressHistory,
  getResourceRecommendations,
  getChatSessions,
  getSessionMessages,
  getRoadmaps,
  getRoadmapById,
  generateRoadmap,
  updatePhaseStatus,
  deleteRoadmap,
  markResourceComplete,
  getUserProfile,
  syncGithubUsername,
  triggerFullAnalysis,
} from "../services/api";

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getUserProfile,
    enabled: enabled && !!localStorage.getItem("auth_token"),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardData,
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useSkillGapLatest() {
  return useQuery({
    queryKey: queryKeys.skillGap,
    queryFn: getLatestSkillGap,
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useGithubAnalysis(enabled = true) {
  return useQuery({
    queryKey: queryKeys.githubAnalysis,
    queryFn: getGithubAnalysis,
    enabled: enabled && !!localStorage.getItem("auth_token"),
  });
}

export function useJobMatches(careerGoal: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobMatches(careerGoal ?? ""),
    queryFn: () => getJobMatches(careerGoal!),
    enabled: !!careerGoal && !!localStorage.getItem("auth_token"),
  });
}

export function useProgressHistory() {
  return useQuery({
    queryKey: queryKeys.progressHistory,
    queryFn: getProgressHistory,
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useResourceRecommendations(goal?: string) {
  return useQuery({
    queryKey: [...queryKeys.resources, goal],
    queryFn: () => getResourceRecommendations(goal),
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useMarkResourceComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      markResourceComplete(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
    },
  });
}

export function useBookmarkResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      bookmarkResource(id, bookmarked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
    },
  });
}

export function useTriggerFullAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof triggerFullAnalysis>[0]) =>
      triggerFullAnalysis(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources });
      queryClient.invalidateQueries({ queryKey: queryKeys.resourceSnapshot });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useChatSessions() {
  return useQuery({
    queryKey: queryKeys.chatSessions,
    queryFn: () => getChatSessions().then((r) => r.sessions),
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chatMessages(sessionId ?? ""),
    queryFn: () => getSessionMessages(sessionId!).then((r) => r.messages),
    enabled: !!sessionId && !!localStorage.getItem("auth_token"),
  });
}

export function useRoadmaps() {
  return useQuery({
    queryKey: queryKeys.roadmaps,
    queryFn: () => getRoadmaps().then((r) => r.roadmaps),
    enabled: !!localStorage.getItem("auth_token"),
  });
}

export function useRoadmapDetail(roadmapId: string | null) {
  return useQuery({
    queryKey: queryKeys.roadmapDetail(roadmapId ?? ""),
    queryFn: () => getRoadmapById(roadmapId!),
    enabled: !!roadmapId && !!localStorage.getItem("auth_token"),
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goal, source }: { goal: string; source?: "ai" | "structured" }) =>
      generateRoadmap(goal, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roadmaps });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, phaseId, status }: { roadmapId: string; phaseId: string; status: "locked" | "available" | "in_progress" | "completed" }) =>
      updatePhaseStatus(roadmapId, phaseId, status),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roadmaps });
      queryClient.invalidateQueries({ queryKey: queryKeys.roadmapDetail(_data.id) });
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roadmaps });
    },
  });
}

export function useSyncGithub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGithubUsername,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.githubAnalysis });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
