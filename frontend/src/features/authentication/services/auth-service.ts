const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function fetchSession() {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }
  return response.json() as Promise<{
    session: { token: string; id: string; userId: string; expiresAt: string };
    user: Record<string, unknown>;
  } | null>;
}
