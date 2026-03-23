import { Verification } from "../models/index.js";
import { verifyBatchOnChain } from "./pharma.service.js";
import "dotenv/config";

const chainId = Number(process.env.CHAIN_ID || 31337);
const contractAddress = process.env.CONTRACT_ADDRESS;

export async function verifyAndLog({
  batchId,
  method,
  inputValue,
  actorUserId = null,
  actorWallet = null,
}) {
  const data = await verifyBatchOnChain(batchId);

  const resultValid = !!data.exists;
  const resultReason = data.exists ? "FOUND" : "NOT_FOUND";

  await Verification.create({
    chainId,
    contractAddress,
    batchId: BigInt(batchId).toString(),
    method,
    inputValue,
    resultValid,
    resultReason,
    scannedByUserId: actorUserId,
    scannedByWallet: actorWallet,
  });

  return { ...data, valid: resultValid, reason: resultReason };
}
