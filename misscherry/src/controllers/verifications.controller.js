import { verifyAndLog } from "../services/verifications.service.js";

export async function verifyBatch(req, res) {
  try {
    const batchId = String(req.params?.batchId || req.body?.batchId || "").trim();

    if (!batchId) {
      return res.status(400).json({
        ok: false,
        error: "Batch ID is required",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null;

    const userAgent = req.headers["user-agent"] || null;

    const result = await verifyAndLog({
      batchId,
      method: req.body?.method || "QR",
      inputValue: req.body?.inputValue || batchId,
      actorUserId: req.user?.id || null,
      actorWallet: req.body?.walletAddress || null,
      ipAddress,
      userAgent,
    });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (e) {
    console.error("VERIFY_BATCH_CONTROLLER_ERROR:", e);

    return res.status(400).json({
      ok: false,
      error: e?.message || "Verification failed. Please try again.",
    });
  }
}