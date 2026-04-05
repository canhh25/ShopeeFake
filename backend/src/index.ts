import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hello World from ShopeeFake API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
