import {
  registerBatchOnChain,
  transferOwnershipOnChain,
  markDeliveredOnChain,
  recallBatchOnChain,
  verifyBatchRead,
  verifyAndLogOnChain,
  getBatch,
  getOwnershipHistory,
  getVerificationHistory,
  getVerificationStats,
  flagSuspicious,
  clearSuspiciousFlag,
  addManufacturer,
  addDistributor,
  addPharmacy,
} from "../services/pharma.service.js";

export async function registerBatch(req, res) {
  try {
    const result = await registerBatchOnChain(req.body);
    res.status(201).json({ ok: true, ...result });
  } catch (e) {
    console.error("REGISTER_BATCH_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function transferOwnership(req, res) {
  try {
    const result = await transferOwnershipOnChain(req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("TRANSFER_OWNERSHIP_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function markDelivered(req, res) {
  try {
    const result = await markDeliveredOnChain(req.params.batchId);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("MARK_DELIVERED_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function recallBatch(req, res) {
  try {
    const result = await recallBatchOnChain(req.params.batchId, req.body.reason);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("RECALL_BATCH_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function verifyBatch(req, res) {
  try {
    const result = await verifyBatchRead(req.params.batchId);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("VERIFY_BATCH_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function verifyAndLog(req, res) {
  try {
    const result = await verifyAndLogOnChain(req.params.batchId, req.body.note);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("VERIFY_AND_LOG_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function fetchBatch(req, res) {
  try {
    const result = await getBatch(req.params.batchId);
    res.json({ ok: true, batch: result });
  } catch (e) {
    console.error("GET_BATCH_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function fetchOwnershipHistory(req, res) {
  try {
    const result = await getOwnershipHistory(req.params.batchId);
    res.json({ ok: true, history: result });
  } catch (e) {
    console.error("GET_OWNERSHIP_HISTORY_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function fetchVerificationHistory(req, res) {
  try {
    const result = await getVerificationHistory(req.params.batchId);
    res.json({ ok: true, history: result });
  } catch (e) {
    console.error("GET_VERIFICATION_HISTORY_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function fetchVerificationStats(req, res) {
  try {
    const result = await getVerificationStats(req.params.batchId);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("GET_VERIFICATION_STATS_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function adminFlagSuspicious(req, res) {
  try {
    const result = await flagSuspicious(req.params.batchId, req.body.reason);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("FLAG_SUSPICIOUS_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function adminClearSuspicious(req, res) {
  try {
    const result = await clearSuspiciousFlag(req.params.batchId);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("CLEAR_SUSPICIOUS_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function grantManufacturer(req, res) {
  try {
    const result = await addManufacturer(req.body.account);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("ADD_MANUFACTURER_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function grantDistributor(req, res) {
  try {
    const result = await addDistributor(req.body.account);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("ADD_DISTRIBUTOR_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }
}

export async function grantPharmacy(req, res) {
  try {
    const result = await addPharmacy(req.body.account);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("ADD_PHARMACY_ERROR:", e);
    res.status(500).json({ ok: false, error: e.shortMessage || e.reason || e.message });
  }

  
}
export async function uploadMetadata(req, res) {
  try {
    const metadata = req.body;

    if (!metadata || Object.keys(metadata).length === 0) {
      return res.status(400).json({ ok: false, error: "Metadata is required" });
    }

    // Upload to IPFS
    const cid = await uploadToIPFS(metadata);

    const metadataURI = `ipfs://${cid}`;

    res.status(201).json({ ok: true, metadataURI });
  } catch (e) {
    console.error("UPLOAD_METADATA_ERROR:", e);
    res.status(500).json({
      ok: false,
      error: e.message || "Failed to upload metadata",
    });
  }
}