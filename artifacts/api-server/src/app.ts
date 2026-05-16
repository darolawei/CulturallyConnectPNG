import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const writeWindowMs = 60_000;
const writeMaxPerWindow = 30;
const writeBuckets = new Map<string, { start: number; count: number }>();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }
  const key = req.ip || "unknown";
  const now = Date.now();
  const bucket = writeBuckets.get(key);
  if (!bucket || now - bucket.start > writeWindowMs) {
    writeBuckets.set(key, { start: now, count: 1 });
    next();
    return;
  }
  if (bucket.count >= writeMaxPerWindow) {
    res.status(429).json({ error: "Too many write requests. Please retry shortly." });
    return;
  }
  bucket.count += 1;
  next();
});

app.use("/api", router);

const frontendDist = path.resolve(process.cwd(), "artifacts/culturally-connect-png/dist/public");

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
