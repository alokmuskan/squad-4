import app from "./app";
import { env } from "./config/env";
import { initDb } from "./database";

// 1. Handle asynchronous database initialization safely for serverless environments
initDb()
  .then(() => {
    console.log("Database initialized successfully.");
  })
  .catch((error) => {
    // This will print the exact database error inside your Vercel Dashboard Logs
    console.error("CRITICAL: Failed to initialize database:", error);
  });

// 2. Only spin up the app.listen loop when running locally
// Vercel handles the listener step automatically in production
if (process.env.NODE_ENV !== "production") {
  app.listen(env.PORT, () => {
    console.log(`Server is running locally on port ${env.PORT}`);
  });
}

// 3. CRITICAL FOR VERCEL: Export the app instance so the serverless router can handle requests
export default app;