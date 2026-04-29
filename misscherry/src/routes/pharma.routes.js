import { Router } from "express";
import {
  fetchBatch,
  fetchOwnershipHistory,
  fetchVerificationHistory,
  verifyBatch,
} from "../controllers/pharma.controller.js";
import { Verification } from "../models/index.js";
import {
  getAllBatches,
  getBatchCount,
} from "../services/pharma.service.js";

const router = Router();

router.get("/batches/count", async (req, res) => {
  try {
    const count = await getBatchCount();
    res.json({ ok: true, count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/batches", async (req, res) => {
  try {
    const batches = await getAllBatches();

    const enriched = await Promise.all(
      batches.map(async (batch) => {
        const batchId = String(batch.batchId);
        const status = Number(batch.status);

        const verificationCount = await Verification.count({
          where: { batchId },
        });

        const uniqueVerifierCount = await Verification.count({
          where: { batchId },
          distinct: true,
          col: "inputValue",
        });

        let suspicious = Boolean(batch.suspicious);
        let suspiciousReason = null;

        if (status === 3) {
          suspicious = true;
          suspiciousReason = "Recalled batch scanned";
        } else if (
          uniqueVerifierCount > 5 &&
          status !== 2
        ) {
          suspicious = true;
          suspiciousReason = "Too many unique verifiers before delivery";
        }

        return {
          ...batch,
          suspicious,
          suspiciousReason,
          verificationCount,
          uniqueVerifierCount,
        };
      })
    );

    res.json({ ok: true, batches: enriched });
  } catch (err) {
    console.error("FETCH_BATCHES_ERROR:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/batches/:batchId/verify", verifyBatch);
router.get("/batches/:batchId/ownership-history", fetchOwnershipHistory);
router.get("/batches/:batchId/verification-history", fetchVerificationHistory);

// Must be last
router.get("/batches/:batchId", fetchBatch);
router.get("/batches/suspicious/count", async (req, res) => {
  try {
    const batches = await getAllBatches();

    let suspiciousCount = 0;

    for (const batch of batches) {
      const batchId = String(batch.batchId);
      const status = Number(batch.status);

      const uniqueVerifierCount = await Verification.count({
        where: { batchId },
        distinct: true,
        col: "inputValue",
      });

      let suspicious = Boolean(batch.suspicious);

      if (status === 3) {
        suspicious = true;
      } else if (
        uniqueVerifierCount > 5 &&
        status !== 2
      ) {
        suspicious = true;
      }

      if (suspicious) {
        suspiciousCount++;
      }
    }

    res.json({
      ok: true,
      suspiciousCount,
      totalBatches: batches.length,
    });
  } catch (err) {
    console.error("SUSPICIOUS_COUNT_ERROR:", err);

    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

export default router;