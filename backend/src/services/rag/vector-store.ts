import { prisma } from "@/database";

export const VECTOR_COLLECTIONS = {
	JOB_REQUIREMENTS: "career_profile",
	SKILL_GRAPH: "skill_graph",
	LEARNING_RESOURCES: "learning_resource",
	CAREER_PATHS: "career_path",
} as const;

export type VectorCollection =
	(typeof VECTOR_COLLECTIONS)[keyof typeof VECTOR_COLLECTIONS];

function cosineSimilarity(a: number[], b: number[]): number {
	const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
	const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
	const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
	if (magA === 0 || magB === 0) return 0;
	return dot / (magA * magB);
}

export async function storeVectors(
	collection: VectorCollection,
	entries: {
		id: string;
		title: string;
		content: string;
		embedding: number[];
		metadata: Record<string, unknown>;
	}[],
): Promise<void> {
	for (const entry of entries) {
		const existing = await prisma.vectorDocument.findUnique({
			where: { id: entry.id },
		});

		if (existing) {
			await prisma.vectorDocument.update({
				where: { id: entry.id },
				data: {
					embedding: JSON.stringify(entry.embedding),
					content: entry.content,
					metadata: entry.metadata as any,
				},
			});
		} else {
			await prisma.vectorDocument.create({
				data: {
					id: entry.id,
					source: collection,
					title: entry.title,
					content: entry.content,
					metadata: entry.metadata as any,
					embedding: JSON.stringify(entry.embedding),
				},
			});
		}
	}
}

export async function queryVectors(
	collection: VectorCollection,
	queryEmbedding: number[],
	topK = 5,
	filter?: Record<string, unknown>,
): Promise<
	{
		id: string;
		score: number;
		title: string;
		content: string;
		metadata: Record<string, unknown>;
	}[]
> {
	const docs = await prisma.vectorDocument.findMany({
		where: {
			source: collection,
			embedding: { not: null },
		},
	});

	const scored = docs
		.map((doc) => {
			if (!doc.embedding) return null;
			try {
				const metadata = doc.metadata as Record<string, unknown>;

				if (filter) {
					for (const [key, value] of Object.entries(filter)) {
						if (metadata[key] !== value) {
							return null;
						}
					}
				}

				const vec = JSON.parse(doc.embedding) as number[];
				const score = cosineSimilarity(queryEmbedding, vec);
				return {
					id: doc.id,
					score,
					title: doc.title,
					content: doc.content,
					metadata,
				};
			} catch {
				return null;
			}
		})
		.filter((r): r is NonNullable<typeof r> => r !== null);

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, topK);
}
