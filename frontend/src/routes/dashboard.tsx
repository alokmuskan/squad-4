import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/routes/_authenticated/Dashboard";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

