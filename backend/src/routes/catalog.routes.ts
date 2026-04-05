import { Router } from "express";
import { listPublicProducts } from "../controllers/catalog.controller.js";

const router = Router();

router.get("/products", listPublicProducts);

export default router;
