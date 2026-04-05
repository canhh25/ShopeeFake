import { Router } from "express";
import { checkout } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.post("/checkout", checkout);

export default router;
