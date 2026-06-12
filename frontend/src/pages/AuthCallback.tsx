import { useEffect, useState } from "react";

interface AuthCallbackProps {
  onLoginSuccess: (token: string, user: any) => void;
  onLoginFailure: (error: string) => void;
}

export default function AuthCallback({
  onLoginSuccess,
  onLoginFailure,
}: AuthCallbackProps) {
  const [status, setStatus] = useState("Authenticating with GitHub...");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      onLoginFailure("No authorization code received from GitHub.");
      return;
    }

    // Call local Express backend to perform token exchange
    fetch("http://localhost:5000/api/auth/github", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to authenticate with backend server.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          onLoginSuccess(data.token, data.user);
        } else {
          throw new Error("No token returned from authentication server.");
        }
      })
      .catch((err) => {
        console.error(err);
        onLoginFailure(err.message || "An error occurred during authentication.");
      });
  }, [onLoginSuccess, onLoginFailure]);

  return (
    <div className="min-h-screen bg-[#F8F6E8] flex flex-col items-center justify-center">
      <div className="bg-white rounded-[36px] shadow-2xl p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin text-5xl text-[#171C4A]">🐙</div>
        </div>
        <h2 className="text-3xl font-black text-[#171C4A] mb-4">Please Wait</h2>
        <p className="text-gray-500 font-medium">{status}</p>
      </div>
    </div>
  );
}
