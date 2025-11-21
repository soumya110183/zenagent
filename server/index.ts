import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Validate optional environment variables
function validateEnvironment() {
  const optionalVars = ["DATABASE_URL", "SESSION_SECRET", "OPENAI_API_KEY"];
  const missingOptional = optionalVars.filter(v => !process.env[v]);

  if (missingOptional.length > 0) {
    console.warn(`⚠️  Missing optional environment variables: ${missingOptional.join(", ")}`);
    if (!process.env.DATABASE_URL) {
      console.warn("   Using in-memory storage (data will be lost on restart)");
    }
  }
}

validateEnvironment();

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false, limit: "100mb" }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Vite (only in dev)
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Safe Windows host + port
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";
 // avoid Windows ENOTSUP

  server
    .listen({ port, host }, () => {
      log(
        `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on http://${host}:${port}`
      );
    })
    .on("error", (err) => {
      console.error("Server failed to start:", err);
      process.exit(1);
    });
})();
