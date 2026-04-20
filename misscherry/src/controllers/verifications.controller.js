import { verifyAndLog } from "../services/verifications.service.js";

export async function verifyBatch(req, res) {
  try {
    const batchId =
      req.params.batchId || req.body.batchId;

    if (!batchId) {
      return res.status(400).json({
        ok: false,
        error: "Batch ID is required",
      });
    }

    const method = req.body?.method || "ID";
    const inputValue = req.body?.inputValue || String(batchId);

    const actorUserId = req.user?.id || null;
    const actorWallet = req.body?.walletAddress || null;

    const result = await verifyAndLog({
      batchId: String(batchId), // IMPORTANT (hash-safe)
      method,
      inputValue,
      actorUserId,
      actorWallet,
    });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (e) {
    console.error("VERIFY_BATCH_CONTROLLER_ERROR:", e);

    return res.status(400).json({
      ok: false,
      error:
        e?.message ||
        "Verification failed. Please try again.",
    });
  }
}