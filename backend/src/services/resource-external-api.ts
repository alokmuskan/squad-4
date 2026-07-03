interface ExternalResource {
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration: string;
	reason: string;
	rating: number;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const UDEMY_API_BASE = "https://www.udemy.com/api-2.0";

const externalCache = new Map<
	string,
	{ data: ExternalResource[]; expiry: number }
>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCached(key: string): ExternalResource[] | null {
	const cached = externalCache.get(key);
	if (cached && cached.expiry > Date.now()) return cached.data;
	return null;
}

function setCache(key: string, data: ExternalResource[]): void {
	externalCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function searchYouTube(
	skill: string,
	limit: number,
): Promise<ExternalResource[]> {
	const apiKey = process.env.YOUTUBE_API_KEY;
	if (!apiKey) return [];

	const cacheKey = `yt:${skill}:${limit}`;
	const cached = getCached(cacheKey);
	if (cached) return cached;

	try {
		const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(`${skill} tutorial course`)}&type=playlist,video&maxResults=${limit * 2}&relevanceLanguage=en&order=relevance&key=${apiKey}`;
		const response = await fetch(searchUrl);
		if (!response.ok) return [];

		const data = (await response.json()) as {
			items?: {
				id: { videoId?: string; playlistId?: string };
				snippet: { title: string; channelTitle: string; description: string };
			}[];
		};
		if (!data.items) return [];

		const results: ExternalResource[] = data.items
			.slice(0, limit)
			.map((item) => {
				return {
					title: item.snippet.title,
					url: item.id.videoId
						? `https://youtube.com/watch?v=${item.id.videoId}`
						: `https://youtube.com/playlist?list=${item.id.playlistId}`,
					platform: "YouTube",
					type: item.id.playlistId ? "course" : "video",
					difficulty: "intermediate",
					duration: "Varies",
					reason: `Free ${item.id.playlistId ? "playlist" : "video"} by ${item.snippet.channelTitle}`,
					rating: 0,
				};
			});

		setCache(cacheKey, results);
		return results;
	} catch {
		return [];
	}
}

async function searchUdemy(
	skill: string,
	limit: number,
): Promise<ExternalResource[]> {
	const clientId = process.env.UDEMY_CLIENT_ID;
	const clientSecret = process.env.UDEMY_CLIENT_SECRET;
	if (!clientId || !clientSecret) return [];

	const cacheKey = `udemy:${skill}:${limit}`;
	const cached = getCached(cacheKey);
	if (cached) return cached;

	try {
		const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
		const searchUrl = `${UDEMY_API_BASE}/courses/?search=${encodeURIComponent(skill)}&page_size=${limit}&ordering=relevance&price=price-free,price-paid`;
		const response = await fetch(searchUrl, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: "application/json, text/plain, */*",
			},
		});
		if (!response.ok) return [];

		const data = (await response.json()) as {
			results?: {
				id: number;
				title: string;
				url: string;
				price: string;
				headline: string;
				avg_rating: number;
				num_reviews: number;
				instructional_level: string;
				content_info: string;
			}[];
		};
		if (!data.results) return [];

		const results: ExternalResource[] = data.results
			.slice(0, limit)
			.map((course) => ({
				title: course.title,
				url: `https://udemy.com${course.url}`,
				platform: "Udemy",
				type: "course",
				difficulty: course.instructional_level?.toLowerCase() || "intermediate",
				duration: course.content_info || "Varies",
				reason: `Rating: ${course.avg_rating.toFixed(1)}/5 — ${course.headline}`,
				rating: course.avg_rating,
			}));

		setCache(cacheKey, results);
		return results;
	} catch {
		return [];
	}
}

async function searchDevTo(
	skill: string,
	limit: number,
): Promise<ExternalResource[]> {
	const cacheKey = `devto:${skill}:${limit}`;
	const cached = getCached(cacheKey);
	if (cached) return cached;

	try {
		const searchUrl = `https://dev.to/api/articles?tag=${encodeURIComponent(skill.toLowerCase())}&per_page=${limit}&state=rising`;
		const response = await fetch(searchUrl);
		if (!response.ok) return [];

		const data = (await response.json()) as {
			title: string;
			url: string;
			tags: string[];
			positive_reactions_count: number;
			reading_time_minutes: number;
			user: { name: string };
		}[];
		if (!Array.isArray(data)) return [];

		const results: ExternalResource[] = data.slice(0, limit).map((article) => ({
			title: article.title,
			url: article.url,
			platform: "Dev.to",
			type: "article",
			difficulty: "intermediate",
			duration: `${article.reading_time_minutes} min read`,
			reason: `By ${article.user?.name || "community"} — ${article.positive_reactions_count} reactions`,
			rating: Math.min(article.positive_reactions_count / 10, 5),
		}));

		setCache(cacheKey, results);
		return results;
	} catch {
		return [];
	}
}

export async function searchExternalResources(
	skill: string,
	limit: number,
): Promise<ExternalResource[]> {
	const results = await Promise.allSettled([
		searchYouTube(skill, limit),
		searchUdemy(skill, limit),
		searchDevTo(skill, limit),
	]);

	const allResources: ExternalResource[] = [];
	for (const result of results) {
		if (result.status === "fulfilled") {
			allResources.push(...result.value);
		}
	}

	allResources.sort((a, b) => b.rating - a.rating);

	const seen = new Set<string>();
	const deduped: ExternalResource[] = [];
	for (const r of allResources) {
		if (seen.has(r.url)) continue;
		seen.add(r.url);
		deduped.push(r);
	}

	return deduped.slice(0, limit);
}
