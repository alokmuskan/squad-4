import "module-alias/register";
import app from "./app";
import { env } from "./config/env";
import { initDb } from "./database";

// 1. Handle asynchronous database initialization safely
initDb()
  .then(() => {
    console.log("Database initialized successfully.");
  })
  .catch((error) => {
    console.error("CRITICAL: Failed to initialize database:", error);
  });

// 2. Explicitly cast the port string to a Number for TypeScript compiler validation
const PORT = Number(process.env.PORT || env.PORT || 5001);

// 3. Keep the server listening continuously so Render does not exit early
app.listen(PORT, () => {
  console.log(`Server is running actively on port ${PORT}`);
});

// 4. Export the app instance to preserve fallback serverless environment matching
export default app;