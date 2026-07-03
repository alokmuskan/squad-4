export interface RoadmapPhase {
	id: string;
	label: string;
	duration: string;
	description: string;
	skills: string[];
	milestones: string[];
	resources: { label: string; url: string }[];
	status: "locked" | "available" | "in_progress" | "completed";
	order: number;
}

export interface RoadmapResponse {
	id: string;
	title: string;
	goal: string;
	duration: string;
	phases: RoadmapPhase[];
	progress: number;
	createdAt: string;
	updatedAt: string;
}

export interface GenerateRoadmapInput {
	goal: string;
	source?: "ai" | "structured";
}

export interface UpdatePhaseInput {
	phaseId: string;
	status: RoadmapPhase["status"];
}
