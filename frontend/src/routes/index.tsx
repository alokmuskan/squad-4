
import { createFileRoute } from "@tanstack/react-router";
import Home from "@/routes/_public/Home";

export const Route = createFileRoute("/")({
  component: Home,
});


