const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function getGitHubOAuthRedirectUri() {
  return `${window.location.origin}/auth/callback`;
}

export function getGoogleOAuthRedirectUri() {
  return `${window.location.origin}/auth/google/callback`;
}

async function startSocialOAuth(provider: "google" | "github") {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        provider,
        callbackURL: `${window.location.origin}/auth/callback`,
        disableRedirect: true,
      }),
    });
    

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to start ${provider} sign-in`);
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No authorization URL returned from server");
    }
  } catch (err) {
    alert(
      `Sign in with ${provider} failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}

export function startGitHubOAuth() {
  startSocialOAuth("github");
}

export function startGoogleOAuth() {
  startSocialOAuth("google");
}
