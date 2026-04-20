import { Router } from "express";
import {
  fetchOwnershipHistory,
  fetchVerificationHistory,
  verifyBatch,
} from "../controllers/pharma.controller.js";
import { getAllBatches, getBatchCount } from "../services/pharma.service.js";

const router = Router();

/* =========================
   STATIC BATCH ROUTES
========================= */

router.get("/batches/count", async (req, res) => {
  try {
    const count = await getBatchCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/batches", async (req, res) => {
  try {
    const batches = await getAllBatches();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   BATCH HISTORY / VERIFY ROUTES
========================= */

router.get("/batches/:batchId/verify", verifyBatch);
router.get("/batches/:batchId/ownership-history", fetchOwnershipHistory);
router.get("/batches/:batchId/verification-history", fetchVerificationHistory);

export default router;