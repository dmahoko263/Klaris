import { Verification } from "../models/index.js";
import { getBatch } from "./pharma.service.js";
import "dotenv/config";

const chainId = Number(process.env.CHAIN_ID || 31337);
const contractAddress =
  process.env.CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function verifyAndLog({
  batchId,
  method = "QR",
  inputValue,
  actorUserId = null,
  actorWallet = null,
  ipAddress = null,
  userAgent = null,
}) {
  const safeBatchId = String(batchId || "").trim();

  if (!safeBatchId) {
    throw new Error("Batch ID is required");
  }

  if (/e\+|e-/i.test(safeBatchId) || !/^\d+$/.test(safeBatchId)) {
    throw new Error("Invalid batch ID format");
  }

  const verifierKey =
    actorWallet ||
    `${ipAddress || "unknown-ip"}|${userAgent || "unknown-device"}`;

  console.log("VERIFY_AND_LOG_INPUT:", {
    batchId: safeBatchId,
    method,
    verifierKey,
  });

  const data = await getBatch(safeBatchId);

  const exists = !!data?.exists;
  const contractSuspicious = !!data?.suspicious;
  const status = Number(data?.status ?? 0);

  const expired =
    !!data?.expiryDate && Number(data.expiryDate) > 0
      ? Math.floor(Date.now() / 1000) > Number(data.expiryDate)
      : false;

  let resultValid = false;
  let resultReason = "BATCH_NOT_FOUND";

  if (!exists) {
    resultValid = false;
    resultReason = "BATCH_NOT_FOUND";
  } else if (status === 3) {
    resultValid = false;
    resultReason = "BATCH_RECALLED";
  } else if (expired) {
    resultValid = false;
    resultReason = "BATCH_EXPIRED";
  } else if (contractSuspicious) {
    resultValid = true;
    resultReason = "FOUND_SUSPICIOUS";
  } else {
    resultValid = true;
    resultReason = "AUTHENTIC";
  }

  const created = await Verification.create({
    chainId,
    contractAddress,
    batchId: safeBatchId,
    method,
    inputValue: verifierKey,
    resultValid,
    resultReason,
    scannedByUserId: actorUserId,
    scannedByWallet: actorWallet,
  });

  console.log("VERIFICATION_CREATED:", created.id);

  const verificationCount = await Verification.count({
    where: { batchId: safeBatchId },
  });

  const uniqueVerifierCount = await Verification.count({
    where: { batchId: safeBatchId },
    distinct: true,
    col: "inputValue",
  });

  let suspicious = contractSuspicious;
  let suspiciousReason = contractSuspicious
    ? "Batch has been flagged suspicious on-chain"
    : null;

  if (uniqueVerifierCount > 0 && status !== 2 && status !== 3) {
    suspicious = true;
    suspiciousReason = "Too many unique verifiers before delivery";
  }

  if (expired) {
    suspicious = true;
    suspiciousReason = "Expired batch scanned";
  }

 if (status === 3) {
  suspicious = true;
  suspiciousReason = "Recalled batch scanned";
  resultValid = false;
  resultReason = "BATCH_RECALLED";
}

  const finalReason =
    suspicious && resultValid ? "FOUND_SUSPICIOUS" : resultReason;

  return {
    ...data,
    batchId: safeBatchId,
    valid: resultValid,
    reason: finalReason,
    suspicious,
    suspiciousReason,
    verificationCount,
    uniqueVerifierCount,
  };
}