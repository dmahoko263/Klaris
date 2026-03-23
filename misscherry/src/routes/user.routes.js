import { Router } from "express";
import { getAllUsers, updateUserWallet, toggleUserActive } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, getAllUsers);
router.patch("/:id/wallet", authRequired, updateUserWallet);
router.patch("/:id/toggle-active", authRequired, toggleUserActive);

export default router;