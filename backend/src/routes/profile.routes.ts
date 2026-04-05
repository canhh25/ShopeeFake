import { Router } from "express";
import { getMe, patchMe } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMe);
router.patch("/", patchMe);

export default router;
