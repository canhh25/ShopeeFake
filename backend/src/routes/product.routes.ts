import { Router } from "express";
import {
  create,
  getOne,
  list,
  remove,
  update,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
