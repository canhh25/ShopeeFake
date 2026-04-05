import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "connected" });
  } catch (e) {
    console.error(e);
    res.status(503).json({ ok: false, database: "error" });
  }
});

export default router;
