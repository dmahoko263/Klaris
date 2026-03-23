import { Router } from "express";
import { verifyBatch } from "../controllers/verifications.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

// optional auth — keep open if you want public verification
router.post("/", verifyBatch);

export default router;