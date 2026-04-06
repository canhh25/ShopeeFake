/**
 * Cấp quyền ADMIN (SQLite): UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
 */
import { Router } from "express";
import { getStats, listUsers, toggleUserBlock } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/stats", getStats);  
router.get("/users", listUsers);
router.patch("/users/:id/toggle-block", toggleUserBlock);

export default router;
