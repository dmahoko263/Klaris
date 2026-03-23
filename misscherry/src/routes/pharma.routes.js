import { Router } from "express";
import {
  registerBatch,
  transferOwnership,
  markDelivered,
  recallBatch,
  verifyBatch,
  verifyAndLog,
  fetchBatch,
  fetchOwnershipHistory,
  fetchVerificationHistory,
  fetchVerificationStats,
  adminFlagSuspicious,
  adminClearSuspicious,
  grantManufacturer,
  grantDistributor,
  grantPharmacy,
} from "../controllers/pharma.controller.js";
import { requireWalletRole } from "../middleware/walletRole.middleware.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { getAllBatches, getBatchCount } from "../services/pharma.service.js";

const router = Router(); // ← must be before all route declarations

// Role routes
router.post("/roles/manufacturer", grantManufacturer);
router.post("/roles/distributor", grantDistributor);
router.post("/roles/pharmacy", grantPharmacy);

// Static batch routes FIRST
router.get("/batches/count", async (req, res) => {
  try {
    const count = await getBatchCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/batches", async (req, res) => {
  try {
    const batches = await getAllBatches();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic :batchId routes AFTER static
router.get("/batches/:batchId/verify", verifyBatch);
router.get("/batches/:batchId/ownership-history", fetchOwnershipHistory);
router.get("/batches/:batchId/verification-history", fetchVerificationHistory);
router.get("/batches/:batchId/verification-stats", fetchVerificationStats);
router.get("/batches/:batchId", fetchBatch);

// POST routes
router.post("/batches", authRequired, requireWalletRole("manufacturer"), registerBatch);
router.post("/batches/transfer", transferOwnership);
router.post("/batches/:batchId/deliver", markDelivered);
router.post("/batches/:batchId/verify-log", verifyAndLog);
router.post("/batches/:batchId/recall", recallBatch);
router.post("/batches/:batchId/flag-suspicious", adminFlagSuspicious);
router.post("/batches/:batchId/clear-suspicious", adminClearSuspicious);

export default router;