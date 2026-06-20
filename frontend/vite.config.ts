import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routeFileIgnorePattern:
        "^(AuthCallback|Dashboard|GithubAnalysis|Home|LoginPage|ResumeAnalysis|ResumeAnalysisCover)\\.tsx$",
    }), // keep this first
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
