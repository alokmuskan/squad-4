import { createFileRoute } from "@tanstack/react-router";
import AuthCallback from "@/routes/_public/AuthCallback";

export const Route = createFileRoute("/auth/callback/google")({
  component: AuthCallback,
});
