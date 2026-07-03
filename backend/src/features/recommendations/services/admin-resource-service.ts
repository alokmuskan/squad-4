import { prisma } from "@/database";
import { generateEmbedding } from "@/services/rag/embedding";
import { storeVectors, VECTOR_COLLECTIONS } from "@/services/rag/vector-store";

interface CreateResourceInput {
	skill: string;
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration?: string;
	reason: string;
	tags?: string[];
}

interface UpdateResourceInput extends Partial<CreateResourceInput> {
	active?: boolean;
}

interface ResourceResponse {
	id: string;
	skill: string;
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration: string | null;
	reason: string;
	tags: string[];
	active: boolean;
	source: string;
	rating: number;
	voteCount: number;
	createdAt: string;
	updatedAt: string;
}

function toResponse(r: any): ResourceResponse {
	return {
		id: r.id,
		skill: r.skill,
		title: r.title,
		url: r.url,
		platform: r.platform,
		type: r.type,
		difficulty: r.difficulty,
		duration: r.duration,
		reason: r.reason,
		tags: r.tags || [],
		active: r.active,
		source: r.source,
		rating: r.rating,
		voteCount: r.voteCount,
		createdAt: r.createdAt.toISOString(),
		updatedAt: r.updatedAt.toISOString(),
	};
}

export async function createResource(
	input: CreateResourceInput,
): Promise<ResourceResponse> {
	const resource = await prisma.learningResource.create({
		data: {
			skill: input.skill,
			title: input.title,
			url: input.url,
			platform: input.platform,
			type: input.type,
			difficulty: input.difficulty,
			duration: input.duration || null,
			reason: input.reason,
			tags: input.tags || [],
			source: "curated",
		},
	});

	await indexResourceForRag(resource);
	return toResponse(resource);
}

export async function updateResource(
	id: string,
	input: UpdateResourceInput,
): Promise<ResourceResponse> {
	const resource = await prisma.learningResource.update({
		where: { id },
		data: {
			...(input.skill !== undefined && { skill: input.skill }),
			...(input.title !== undefined && { title: input.title }),
			...(input.url !== undefined && { url: input.url }),
			...(input.platform !== undefined && { platform: input.platform }),
			...(input.type !== undefined && { type: input.type }),
			...(input.difficulty !== undefined && { difficulty: input.difficulty }),
			...(input.duration !== undefined && { duration: input.duration }),
			...(input.reason !== undefined && { reason: input.reason }),
			...(input.tags !== undefined && { tags: input.tags }),
			...(input.active !== undefined && { active: input.active }),
		},
	});

	await indexResourceForRag(resource);
	return toResponse(resource);
}

export async function deactivateResource(id: string): Promise<void> {
	await prisma.learningResource.update({
		where: { id },
		data: { active: false },
	});
}

export async function listResources(params: {
	skill?: string;
	platform?: string;
	difficulty?: string;
	type?: string;
	active?: boolean;
	page?: number;
	limit?: number;
}): Promise<{
	resources: ResourceResponse[];
	total: number;
	page: number;
	limit: number;
}> {
	const where: Record<string, unknown> = {};
	if (params.skill)
		where.skill = { contains: params.skill, mode: "insensitive" };
	if (params.platform) where.platform = params.platform;
	if (params.difficulty) where.difficulty = params.difficulty;
	if (params.type) where.type = params.type;
	if (params.active !== undefined) where.active = params.active;

	const page = params.page || 1;
	const limit = Math.min(params.limit || 20, 100);
	const skip = (page - 1) * limit;

	const [resources, total] = await Promise.all([
		prisma.learningResource.findMany({
			where: where as any,
			orderBy: { updatedAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.learningResource.count({ where: where as any }),
	]);

	return {
		resources: resources.map(toResponse),
		total,
		page,
		limit,
	};
}

async function indexResourceForRag(resource: {
	id: string;
	title: string;
	skill: string;
	reason: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
}): Promise<void> {
	const content = `${resource.title}: ${resource.reason}`;
	const embedding = await generateEmbedding(content);
	if (!embedding) return;

	const existing = await prisma.vectorDocument.findUnique({
		where: { id: resource.id },
	});

	if (existing) {
		await prisma.vectorDocument.update({
			where: { id: resource.id },
			data: {
				title: resource.title,
				content,
				embedding: JSON.stringify(embedding),
				metadata: {
					url: resource.url,
					platform: resource.platform,
					type: resource.type,
					difficulty: resource.difficulty,
					skill: resource.skill,
					reason: resource.reason,
				},
			},
		});
	} else {
		await prisma.vectorDocument.create({
			data: {
				id: resource.id,
				source: "learning_resource",
				title: resource.title,
				content,
				embedding: JSON.stringify(embedding),
				metadata: {
					url: resource.url,
					platform: resource.platform,
					type: resource.type,
					difficulty: resource.difficulty,
					skill: resource.skill,
					reason: resource.reason,
				},
			},
		});
	}
}
