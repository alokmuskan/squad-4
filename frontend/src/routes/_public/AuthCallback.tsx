import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GITHUB_OAUTH_STATE_KEY = "github_oauth_state";

export default function AuthCallback() {
  const navigate = useNavigate();
  const isGoogle =
    window.location.pathname === "/auth/callback/google";

  const [status, setStatus] = useState(
    isGoogle
      ? "Authenticating with Google..."
      : "Authenticating with GitHub..."
  );
  

  const hasRun = useRef(false);

  const redirect_uri = isGoogle
    ? `${window.location.origin}/auth/callback/google`
    : `${window.location.origin}/auth/callback/github`;

  const endpoint = isGoogle
    ? `${API_BASE_URL}/api/auth/google`
    : `${API_BASE_URL}/api/auth/github`;

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      setStatus(`No authorization code received from ${isGoogle ? "Google" : "GitHub"}.`);
      return;
    }

    if (!isGoogle) {
      const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
      sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);

      if (!state || state !== expectedState) {
        setStatus("GitHub authentication failed. Please try signing in again.");
        return;
      }
    }

    setStatus("Exchanging code with backend...");

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirect_uri,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to authenticate with backend server."
          );
        }

        return data;
      })
      .then((data) => {
        if (data.token) {
          setStatus("Login successful! Redirecting...");

          localStorage.setItem("auth_token", data.token);
          localStorage.setItem(
            "auth_user",
            JSON.stringify(data.user)
          );

          navigate({ to: "/dashboard" });
        } else {
          throw new Error(
            "No token returned from authentication server."
          );
        }
      })
      .catch((err) => {
        console.error("Auth callback error:", err);

        setStatus(err.message || "Authentication failed.");
      });
  }, [endpoint, isGoogle, navigate, redirect_uri]);

  return (
    <div className="min-h-screen bg-[#F8F6E8] flex flex-col items-center justify-center">
      <div className="bg-white rounded-[36px] shadow-2xl p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin text-5xl text-[#171C4A]">
            {isGoogle ? "🔐" : "🐙"}
          </div>
        </div>

        <h2 className="text-3xl font-black text-[#171C4A] mb-4">
          Please Wait
        </h2>

        <p className="text-gray-500 font-medium">
          {status}
        </p>
      </div>
    </div>
  );
}
