export interface ChatSessionResponse {
	id: string;
	title: string;
	messageCount: number;
	lastMessageAt: string;
	createdAt: string;
}

export interface ChatMessageResponse {
	id: string;
	sessionId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
}

export interface SendMessageResponse {
	message: ChatMessageResponse;
	reply: ChatMessageResponse;
}

