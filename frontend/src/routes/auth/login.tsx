import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/routes/_public/LoginPage";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
