import { ethers } from "ethers";
import { pharma } from "../contract.js";

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

export async function registerBatchOnChain(payload) {
  const { batchId, drugName, manufacturerName, manufactureDate, expiryDate, metadataURI } = payload;
  const tx = await pharma.registerBatch(
    BigInt(batchId),
    drugName,
    manufacturerName,
    BigInt(manufactureDate),
    BigInt(expiryDate),
    metadataURI || ""
  );
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function transferOwnershipOnChain(payload) {
  const { batchId, newOwner, note } = payload;
  const tx = await pharma.transferOwnership(
    BigInt(batchId),
    ethers.getAddress(newOwner),
    note || ""
  );
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function markDeliveredOnChain(batchId) {
  const tx = await pharma.markDelivered(BigInt(batchId));
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function recallBatchOnChain(batchId, reason) {
  const tx = await pharma.recallBatch(BigInt(batchId), reason || "");
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function verifyBatchRead(batchId) {
  const result = await pharma.verifyBatch(BigInt(batchId));
  return normalizeBatchResult(result);
}

export async function verifyAndLogOnChain(batchId, note) {
  const tx = await pharma.verifyAndLog(BigInt(batchId), note || "");
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function getBatch(batchId) {
  const result = await pharma.getBatch(BigInt(batchId));
  return normalizeBatchStruct(result);
}

export async function getOwnershipHistory(batchId) {
  const result = await pharma.getOwnershipHistory(BigInt(batchId));
  return normalizeOwnershipHistory(result);
}

export async function getVerificationHistory(batchId) {
  const result = await pharma.getVerificationHistory(BigInt(batchId));
  return normalizeVerificationHistory(result);
}

export async function getVerificationStats(batchId) {
  const result = await pharma.getVerificationStats(BigInt(batchId));
  return {
    totalVerifications: result[0].toString(),
    uniqueVerifiers: result[1].toString(),
    isSuspicious: result[2],
  };
}

export async function flagSuspicious(batchId, reason) {
  const tx = await pharma.flagSuspicious(BigInt(batchId), reason || "");
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function clearSuspiciousFlag(batchId) {
  const tx = await pharma.clearSuspiciousFlag(BigInt(batchId));
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function addManufacturer(account) {
  const address = ethers.getAddress(account); // ← checksum fix
  const tx = await pharma.addManufacturer(address);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function addDistributor(account) {
  const address = ethers.getAddress(account); // ← checksum fix
  const tx = await pharma.addDistributor(address);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function addPharmacy(account) {
  const address = ethers.getAddress(account); // ← checksum fix
  const tx = await pharma.addPharmacy(address);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber?.toString?.() ?? null,
  };
}

export async function getBatchCount() {
  try {
    const count = await pharma.batchCount();
    return Number(count);
  } catch {
    const count = await pharma.getBatchCount();
    return Number(count);
  }
}

// export async function getAllBatches() {
//   const count = await getBatchCount();
//   const batches = [];
//   for (let i = 1; i <= count; i++) {
//     try {
//       const batch = await getBatch(i);
//       batches.push(batch);
//     } catch {}
//   }
//   return batches;
// }

// export async function getBatchCount() {
//   const filter = pharma.filters.BatchRegistered();
//   const events = await pharma.queryFilter(filter);
//   return events.length;
// }

export async function getAllBatches() {
  try {
    const filter = pharma.filters.BatchRegistered();
    const events = await pharma.queryFilter(filter);
    
    const batches = [];
    for (const event of events) {
      const batchId = event.args[0]; // first arg is batchId
      try {
        const batch = await getBatch(batchId.toString());
        batches.push(batch);
      } catch {}
    }
    return batches;
  } catch (e) {
    console.error("GET_ALL_BATCHES_ERROR:", e);
    return [];
  }
}