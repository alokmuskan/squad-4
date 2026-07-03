export interface ResourceRecommendationResponse {
	id: string;
	skill: string;
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration: string | null;
	reason: string;
	completed: boolean;
	source: string;
	rating: number | null;
	voteCount: number;
	bookmarked: boolean;
	createdAt: string;
}

