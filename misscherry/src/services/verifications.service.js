import { Verification } from "../models/index.js";
import { verifyBatchOnChain } from "./pharma.service.js";
import "dotenv/config";

const chainId = Number(process.env.CHAIN_ID || 31337);
const contractAddress = process.env.CONTRACT_ADDRESS || null;

export async function verifyAndLog({
  batchId,
  method = "ID",
  inputValue,
  actorUserId = null,
  actorWallet = null,
}) {
  const normalizedBatchId = String(batchId || "").trim();

  if (!normalizedBatchId) {
    throw new Error("Batch ID is required");
  }

  let safeBatchId;
  try {
    safeBatchId = BigInt(normalizedBatchId).toString();
  } catch {
    throw new Error("Invalid batch ID format");
  }

  let data;
  try {
    data = await verifyBatchOnChain(safeBatchId);
  } catch (error) {
    throw new Error(
      error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "Failed to verify batch on chain"
    );
  }

  const exists = !!data?.exists;
  const suspicious = !!data?.suspicious;
  const status = Number(data?.status ?? 0);
  const expired =
    !!data?.expiryDate && Number(data.expiryDate) > 0
      ? Math.floor(Date.now() / 1000) > Number(data.expiryDate)
      : false;

  let resultValid = false;
  let resultReason = "NOT_FOUND";

  if (!exists) {
    resultValid = false;
    resultReason = "BATCH_NOT_FOUND";
  } else if (status === 3) {
    resultValid = false;
    resultReason = "BATCH_RECALLED";
  } else if (expired) {
    resultValid = false;
    resultReason = "BATCH_EXPIRED";
  } else if (suspicious) {
    resultValid = true;
    resultReason = "FOUND_SUSPICIOUS";
  } else {
    resultValid = true;
    resultReason = "AUTHENTIC";
  }

  await Verification.create({
    chainId,
    contractAddress,
    batchId: safeBatchId,
    method,
    inputValue: inputValue || normalizedBatchId,
    resultValid,
    resultReason,
    scannedByUserId: actorUserId,
    scannedByWallet: actorWallet,
  });

  return {
    ...data,
    batchId: safeBatchId,
    valid: resultValid,
    reason: resultReason,
  };
}