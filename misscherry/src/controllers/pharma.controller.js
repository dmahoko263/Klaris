import { pharma } from "../config/contract.js";

function toNum(value, fallback = 0) {
  try {
    return Number(value ?? fallback);
  } catch {
    return fallback;
  }
}

function toStr(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function mapBatchTuple(result) {
  const [
    batchId,
    drugName,
    manufacturerName,
    manufactureDate,
    expiryDate,
    metadataURI,
    manufacturer,
    currentOwner,
    status,
    exists,
    suspicious,
    verificationCount,
    uniqueVerifierCount,
    createdAt,
  ] = result;

  return {
    ok: true,
    batchId: toStr(batchId),
    drugName,
    manufacturerName,
    manufactureDate: toStr(manufactureDate),
    expiryDate: toStr(expiryDate),
    metadataURI,
    manufacturer,
    currentOwner,
    status: toNum(status),
    exists: Boolean(exists),
    suspicious: Boolean(suspicious),
    verificationCount: toStr(verificationCount),
    uniqueVerifierCount: toStr(uniqueVerifierCount),
    createdAt: toStr(createdAt),
  };
}

export async function registerBatch(req, res) {
  try {
    const {
      batchId,
      drugName,
      manufacturerName,
      manufactureDate,
      expiryDate,
      metadataURI,
    } = req.body;

    const parsedBatchId = Number(batchId);
    const parsedManufactureDate = Number(manufactureDate);
    const parsedExpiryDate = Number(expiryDate);

    if (!parsedBatchId || Number.isNaN(parsedBatchId)) {
      return res.status(400).json({ ok: false, error: "Invalid batch ID" });
    }

    if (!drugName || !String(drugName).trim()) {
      return res.status(400).json({ ok: false, error: "drugName is required" });
    }

    if (!manufacturerName || !String(manufacturerName).trim()) {
      return res.status(400).json({
        ok: false,
        error: "manufacturerName is required",
      });
    }

    if (!parsedManufactureDate || Number.isNaN(parsedManufactureDate)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid manufactureDate",
      });
    }

    if (!parsedExpiryDate || Number.isNaN(parsedExpiryDate)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid expiryDate",
      });
    }

    const tx = await pharma.registerBatch(
      parsedBatchId,
      String(drugName).trim(),
      String(manufacturerName).trim(),
      parsedManufactureDate,
      parsedExpiryDate,
      String(metadataURI || "").trim()
    );

    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Batch registered successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: parsedBatchId,
    });
  } catch (error) {
    console.error("REGISTER_BATCH_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to register batch",
    });
  }
}

export async function transferOwnership(req, res) {
  try {
    const { batchId, newOwner, note } = req.body;
    const parsedBatchId = Number(batchId);

    if (!parsedBatchId || Number.isNaN(parsedBatchId)) {
      return res.status(400).json({ ok: false, error: "Invalid batch ID" });
    }

    if (!newOwner || !String(newOwner).trim()) {
      return res.status(400).json({ ok: false, error: "newOwner is required" });
    }

    const tx = await pharma.transferOwnership(
      parsedBatchId,
      String(newOwner).trim(),
      String(note || "").trim()
    );

    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Ownership transferred successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: parsedBatchId,
      newOwner: String(newOwner).trim(),
    });
  } catch (error) {
    console.error("TRANSFER_OWNERSHIP_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to transfer ownership",
    });
  }
}

export async function markDelivered(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({ ok: false, error: "Invalid batch ID" });
    }

    const tx = await pharma.markDelivered(batchId);
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Batch marked as delivered successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId,
    });
  } catch (error) {
    console.error("MARK_DELIVERED_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to mark batch as delivered",
    });
  }
}

export async function recallBatch(req, res) {
  try {
    const batchId = Number(req.params.batchId);
    const { reason } = req.body;

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({ ok: false, error: "Invalid batch ID" });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ ok: false, error: "Reason is required" });
    }

    const tx = await pharma.recallBatch(batchId, String(reason).trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Batch recalled successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId,
    });
  } catch (error) {
    console.error("RECALL_BATCH_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to recall batch",
    });
  }
}

export async function verifyBatch(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const result = await pharma.verifyBatch(batchId);

    const [
      valid,
      reason,
      drugName,
      manufacturerName,
      manufactureDate,
      expiryDate,
      manufacturer,
      currentOwner,
      status,
      suspicious,
      verificationCount,
    ] = result;

    return res.json({
      ok: true,
      valid,
      reason,
      drugName,
      manufacturerName,
      manufactureDate: toStr(manufactureDate),
      expiryDate: toStr(expiryDate),
      manufacturer,
      currentOwner,
      status: toNum(status),
      suspicious: Boolean(suspicious),
      verificationCount: toStr(verificationCount),
    });
  } catch (error) {
    console.error("VERIFY_BATCH_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to verify batch",
    });
  }
}

export async function verifyAndLog(req, res) {
  try {
    const batchId = Number(req.params.batchId);
    const { note } = req.body;

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const tx = await pharma.verifyAndLog(batchId, String(note || "").trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Verification logged successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId,
    });
  } catch (error) {
    console.error("VERIFY_AND_LOG_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to verify and log batch",
    });
  }
}

export async function fetchBatch(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const result = await pharma.getBatch(batchId);
    return res.json(mapBatchTuple(result));
  } catch (error) {
    console.error("FETCH_BATCH_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to fetch batch",
    });
  }
}


export async function fetchVerificationHistory(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const result = await pharma.getVerificationHistory(batchId);

    const history = result.map((item) => ({
      verifier: item.verifier,
      timestamp: toStr(item.timestamp),
      validAtScan: Boolean(item.validAtScan),
      note: toStr(item.note),
    }));

    return res.json({
      ok: true,
      history,
    });
  } catch (error) {
    console.error("FETCH_VERIFICATION_HISTORY_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to fetch verification history",
    });
  }
}

export async function fetchVerificationStats(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const result = await pharma.getVerificationStats(batchId);

    const [totalVerifications, uniqueVerifiers, isSuspicious] = result;

    return res.json({
      ok: true,
      totalVerifications: toStr(totalVerifications),
      uniqueVerifiers: toStr(uniqueVerifiers),
      isSuspicious: Boolean(isSuspicious),
    });
  } catch (error) {
    console.error("FETCH_VERIFICATION_STATS_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to fetch verification stats",
    });
  }
}

export async function adminFlagSuspicious(req, res) {
  try {
    const batchId = Number(req.params.batchId);
    const { reason } = req.body;

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        ok: false,
        error: "Reason is required",
      });
    }

    const tx = await pharma.flagSuspicious(batchId, String(reason).trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Batch flagged as suspicious successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId,
    });
  } catch (error) {
    console.error("FLAG_SUSPICIOUS_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to flag suspicious batch",
    });
  }
}

export async function adminClearSuspicious(req, res) {
  try {
    const batchId = Number(req.params.batchId);

    if (!batchId || Number.isNaN(batchId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID",
      });
    }

    const tx = await pharma.clearSuspiciousFlag(batchId);
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Suspicious flag cleared successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId,
    });
  } catch (error) {
    console.error("CLEAR_SUSPICIOUS_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to clear suspicious flag",
    });
  }
}

export async function grantManufacturer(req, res) {
  try {
    const { account } = req.body;

    if (!account || !String(account).trim()) {
      return res.status(400).json({
        ok: false,
        error: "Account is required",
      });
    }

    const tx = await pharma.addManufacturer(String(account).trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Manufacturer role granted successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: String(account).trim(),
    });
  } catch (error) {
    console.error("GRANT_MANUFACTURER_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to grant manufacturer role",
    });
  }
}

export async function fetchOwnershipHistory(req, res) {
  try {
    const batchIdStr = String(req.params.batchId).trim();

    if (!batchIdStr) {
      return res.status(400).json({
        ok: false,
        error: "Batch ID is required",
      });
    }

    let batchId;
    try {
      batchId = BigInt(batchIdStr); // ✅ FIX
    } catch {
      return res.status(400).json({
        ok: false,
        error: "Invalid batch ID format",
      });
    }

    const history = await pharma.getOwnershipHistory(batchId);

    const formatted = history.map((h) => ({
      from: h.from,
      to: h.to,
      timestamp: Number(h.timestamp),
      note: h.note || "",
    }));

    res.json({
      ok: true,
      history: formatted,
    });
  } catch (error) {
    console.error("OWNERSHIP_HISTORY_ERROR:", error);

    res.status(500).json({
      ok: false,
      error:
        error.reason ||
        error.shortMessage ||
        error.message ||
        "Failed to fetch ownership history",
    });
  }
}

export async function grantDistributor(req, res) {
  try {
    const { account } = req.body;

    if (!account || !String(account).trim()) {
      return res.status(400).json({
        ok: false,
        error: "Account is required",
      });
    }

    const tx = await pharma.addDistributor(String(account).trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Distributor role granted successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: String(account).trim(),
    });
  } catch (error) {
    console.error("GRANT_DISTRIBUTOR_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to grant distributor role",
    });
  }
}

export async function grantPharmacy(req, res) {
  try {
    const { account } = req.body;

    if (!account || !String(account).trim()) {
      return res.status(400).json({
        ok: false,
        error: "Account is required",
      });
    }

    const tx = await pharma.addPharmacy(String(account).trim());
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      message: "Pharmacy role granted successfully",
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: String(account).trim(),
    });
  } catch (error) {
    console.error("GRANT_PHARMACY_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to grant pharmacy role",
    });
  }
}

export async function uploadMetadata(req, res) {
  try {
    const metadata = req.body;

    if (!metadata || Object.keys(metadata).length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Metadata payload is required",
      });
    }

    const result = await uploadMetadataToIPFS(metadata);

    return res.status(201).json({
      ok: true,
      message: "Metadata uploaded successfully",
      cid: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      pinata: result,
    });
  } catch (error) {
    console.error("UPLOAD_METADATA_ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to upload metadata",
    });
  }
}