import { ethers } from "ethers";
import { pharma } from "../contract.js";
import { logNetworkActivity } from "./networkActivity.service.js";

async function getSignerAddressSafe() {
  try {
    return await pharma.runner?.getAddress?.();
  } catch {
    return null;
  }
}

function contractAddress() {
  return pharma.target?.toString?.() || pharma.target || null;
}

function normalizeBatchResult(result) {
  return {
    valid: result[0],
    reason: result[1],
    drugName: result[2],
    manufacturerName: result[3],
    manufactureDate: result[4].toString(),
    expiryDate: result[5].toString(),
    manufacturer: result[6],
    currentOwner: result[7],
    status: Number(result[8]),
    suspicious: result[9],
    verificationCount: result[10].toString(),
  };
}

function normalizeBatchStruct(batch) {
  return {
    batchId: batch.batchId.toString(),
    drugName: batch.drugName,
    manufacturerName: batch.manufacturerName,
    manufactureDate: batch.manufactureDate.toString(),
    expiryDate: batch.expiryDate.toString(),
    metadataURI: batch.metadataURI,
    manufacturer: batch.manufacturer,
    currentOwner: batch.currentOwner,
    status: Number(batch.status),
    exists: batch.exists,
    suspicious: batch.suspicious,
    verificationCount: batch.verificationCount.toString(),
    uniqueVerifierCount: batch.uniqueVerifierCount.toString(),
    createdAt: batch.createdAt.toString(),
  };
}

function normalizeOwnershipHistory(items) {
  return items.map((item) => ({
    from: item.from,
    to: item.to,
    timestamp: item.timestamp.toString(),
    note: item.note,
  }));
}

function normalizeVerificationHistory(items) {
  return items.map((item) => ({
    verifier: item.verifier,
    timestamp: item.timestamp.toString(),
    validAtScan: item.validAtScan,
    note: item.note,
  }));
}

async function logSuccess(functionName, method, tx, receipt, payload = null) {
  await logNetworkActivity({
    type: "TX_SUCCESS",
    method,
    functionName,
    txHash: tx?.hash ?? receipt?.hash ?? null,
    blockNumber: receipt?.blockNumber?.toString?.() ?? null,
    fromAddress: tx?.from ?? (await getSignerAddressSafe()),
    toAddress: tx?.to ?? contractAddress(),
    gasUsed: receipt?.gasUsed?.toString?.() ?? null,
    status: "SUCCESS",
    reason: null,
    payload,
  });
}

async function logRevert(functionName, method, payload = null, error = null) {
  await logNetworkActivity({
    type: "TX_REVERTED",
    method,
    functionName,
    txHash: null,
    blockNumber: null,
    fromAddress: await getSignerAddressSafe(),
    toAddress: contractAddress(),
    gasUsed: null,
    status: "REVERTED",
    reason:
      error?.shortMessage ||
      error?.reason ||
      error?.message ||
      "Unknown error",
    payload,
  });
}

async function logCall(functionName, payload = null, status = "SUCCESS", reason = null) {
  const noisySuccessCalls = [
    "getBatch",
    "queryFilter(BatchRegistered)",
    "batchCount",
    "getBatchCount",
  ];

  if (status === "SUCCESS" && noisySuccessCalls.includes(functionName)) {
    return;
  }

  await logNetworkActivity({
    type: "CALL",
    method: "eth_call",
    functionName,
    txHash: null,
    blockNumber: null,
    fromAddress: await getSignerAddressSafe(),
    toAddress: contractAddress(),
    gasUsed: null,
    status,
    reason,
    payload,
  });
}

export async function registerBatchOnChain(payload) {
  const {
    batchId,
    drugName,
    manufacturerName,
    manufactureDate,
    expiryDate,
    metadataURI,
  } = payload;

  try {
    const tx = await pharma.registerBatch(
      BigInt(batchId),
      drugName,
      manufacturerName,
      BigInt(manufactureDate),
      BigInt(expiryDate),
      metadataURI || ""
    );

    const receipt = await tx.wait();

    await logSuccess("registerBatch", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
      batchId: batchId?.toString?.() ?? batchId,
    };
  } catch (e) {
    await logRevert("registerBatch", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function transferOwnershipOnChain(payload) {
  const { batchId, newOwner, note } = payload;

  try {
    const tx = await pharma.transferOwnership(
      BigInt(batchId),
      ethers.getAddress(newOwner),
      note || ""
    );

    const receipt = await tx.wait();

    await logSuccess("transferOwnership", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("transferOwnership", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function markDeliveredOnChain(batchId) {
  const payload = { batchId };

  try {
    const tx = await pharma.markDelivered(BigInt(batchId));
    const receipt = await tx.wait();

    await logSuccess("markDelivered", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("markDelivered", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function recallBatchOnChain(batchId, reason) {
  const payload = { batchId, reason: reason || "" };

  try {
    const tx = await pharma.recallBatch(BigInt(batchId), reason || "");
    const receipt = await tx.wait();

    await logSuccess("recallBatch", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("recallBatch", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function verifyBatchRead(batchId) {
  const payload = { batchId };

  try {
    const result = await pharma.verifyBatch(BigInt(batchId));
    await logCall("verifyBatch", payload, "SUCCESS", null);
    return normalizeBatchResult(result);
  } catch (e) {
    await logCall(
      "verifyBatch",
      payload,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );
    throw e;
  }
}
export async function safeVerify(batchId, note) {
  try {
    return await verifyAndLogOnChain(batchId, note);
  } catch (e) {
    console.warn("Blockchain verify failed, fallback to read");

    const result = await verifyBatchRead(batchId);

    return {
      ...result,
      fallback: true,
      warning: "Verification logged off-chain only",
    };
  }
}
export async function verifyAndLogOnChain(batchId, note) {
  const payload = { batchId, note: note || "" };

  try {
    const id = toBigIntSafe(batchId);

    // 🔍 FIRST: READ VALIDATION
    const batch = await pharma.getBatch(id);

    if (!batch.exists) {
      throw new Error("Batch does not exist");
    }

    // 🚀 THEN: TRANSACTION
    const tx = await pharma.verifyAndLog(id, note || "");
    const receipt = await tx.wait();

    await logSuccess(
      "verifyAndLog",
      "eth_sendRawTransaction",
      tx,
      receipt,
      payload
    );

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("verifyAndLog", "eth_estimateGas", payload, e);

    throw new Error(
      e?.reason ||
        e?.shortMessage ||
        e?.message ||
        "Verification transaction failed"
    );
  }
}

export async function getBatch(batchId) {
  const payload = { batchId };

  try {
    const result = await pharma.getBatch(BigInt(batchId));
    await logCall("getBatch", payload, "SUCCESS", null);
    return normalizeBatchStruct(result);
  } catch (e) {
    await logCall(
      "getBatch",
      payload,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );
    throw e;
  }
}

export async function getOwnershipHistory(batchId) {
  const payload = { batchId };

  try {
    const result = await pharma.getOwnershipHistory(BigInt(batchId));
    await logCall("getOwnershipHistory", payload, "SUCCESS", null);
    return normalizeOwnershipHistory(result);
  } catch (e) {
    await logCall(
      "getOwnershipHistory",
      payload,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );
    throw e;
  }
}

export async function getVerificationHistory(batchId) {
  const payload = { batchId };

  try {
    const result = await pharma.getVerificationHistory(BigInt(batchId));
    await logCall("getVerificationHistory", payload, "SUCCESS", null);
    return normalizeVerificationHistory(result);
  } catch (e) {
    await logCall(
      "getVerificationHistory",
      payload,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );
    throw e;
  }
}

export async function getVerificationStats(batchId) {
  const payload = { batchId };

  try {
    const result = await pharma.getVerificationStats(BigInt(batchId));
    await logCall("getVerificationStats", payload, "SUCCESS", null);

    return {
      totalVerifications: result[0].toString(),
      uniqueVerifiers: result[1].toString(),
      isSuspicious: result[2],
    };
  } catch (e) {
    await logCall(
      "getVerificationStats",
      payload,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );
    throw e;
  }
}

export async function flagSuspicious(batchId, reason) {
  const payload = { batchId, reason: reason || "" };

  try {
    const tx = await pharma.flagSuspicious(BigInt(batchId), reason || "");
    const receipt = await tx.wait();

    await logSuccess("flagSuspicious", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("flagSuspicious", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function clearSuspiciousFlag(batchId) {
  const payload = { batchId };

  try {
    const tx = await pharma.clearSuspiciousFlag(BigInt(batchId));
    const receipt = await tx.wait();

    await logSuccess("clearSuspiciousFlag", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("clearSuspiciousFlag", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function addManufacturer(account) {
  const address = ethers.getAddress(account);
  const payload = { account: address };

  try {
    const tx = await pharma.addManufacturer(address);
    const receipt = await tx.wait();

    await logSuccess("addManufacturer", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("addManufacturer", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function addDistributor(account) {
  const address = ethers.getAddress(account);
  const payload = { account: address };

  try {
    const tx = await pharma.addDistributor(address);
    const receipt = await tx.wait();

    await logSuccess("addDistributor", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("addDistributor", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function addPharmacy(account) {
  const address = ethers.getAddress(account);
  const payload = { account: address };

  try {
    const tx = await pharma.addPharmacy(address);
    const receipt = await tx.wait();

    await logSuccess("addPharmacy", "eth_sendRawTransaction", tx, receipt, payload);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber?.toString?.() ?? null,
    };
  } catch (e) {
    await logRevert("addPharmacy", "eth_estimateGas", payload, e);
    throw e;
  }
}

export async function getBatchCount() {
  try {
    const count = await pharma.batchCount();
    await logCall("batchCount", null, "SUCCESS", null);
    return Number(count);
  } catch {
    const count = await pharma.getBatchCount();
    await logCall("getBatchCount", null, "SUCCESS", null);
    return Number(count);
  }
}

export async function getAllBatches() {
  try {
    const filter = pharma.filters.BatchRegistered();
    const events = await pharma.queryFilter(filter);

    const batches = [];
    for (const event of events) {
      const batchId = event.args[0];
      try {
        const batch = await getBatch(batchId.toString());
        batches.push(batch);
      } catch {}
    }

    await logCall(
      "queryFilter(BatchRegistered)",
      { totalEvents: events.length },
      "SUCCESS",
      null
    );

    return batches;
  } catch (e) {
    console.error("GET_ALL_BATCHES_ERROR:", e);

    await logCall(
      "queryFilter(BatchRegistered)",
      null,
      "REVERTED",
      e?.shortMessage || e?.reason || e?.message || "Unknown error"
    );

    return [];
  }
}