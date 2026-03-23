import { verifyAndLog } from "../services/verifications.service.js";

export async function verifyBatch(req, res) {
  try {
    const { batchId, method = "ID", inputValue } = req.body;

    const actorUserId = req.user?.id || null;
    const actorWallet = req.body.walletAddress || null;

    const r = await verifyAndLog({ batchId, method, inputValue: inputValue || String(batchId), actorUserId, actorWallet });
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}