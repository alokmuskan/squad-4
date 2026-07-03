import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/authentication/hooks/use-auth";
import { fetchSession } from "@/features/authentication/services/auth-service";
import { type AuthUser } from "../types/auth";

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState("Authenticating with Google...");
  const hasRun = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");

    if (oauthError) {
      alert(`Login failed: ${oauthError}`);
      navigate({ to: "/login", replace: true });
      return;
    }

    setStatus("Getting session...");

    fetchSession()
      .then(async (data) => {
        if (!data || !data.session || !data.user) {
          throw new Error("No session found. Authentication may have failed.");
        }
        setStatus("Login successful! Redirecting...");
        await login(data.session.token, data.user as unknown as AuthUser);
        navigate({ to: "/dashboard", replace: true });
      })
      .catch((err: unknown) => {
        console.error("Google auth callback error:", err);
        setStatus("Authentication failed.");
        alert("Login failed: " + (err instanceof Error ? err.message : "Unknown error"));
        navigate({ to: "/login", replace: true });
      });
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-[#F8F6E8] flex flex-col items-center justify-center">
      <div className="bg-white rounded-[36px] shadow-2xl p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin text-5xl text-[#171C4A]">G</div>
        </div>
        <h2 className="text-3xl font-black text-[#171C4A] mb-4">Please Wait</h2>
        <p className="text-gray-500 font-medium">{status}</p>
      </div>
    </div>
  );
}
