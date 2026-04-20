import { NetworkActivity } from "../models/index.js";

export async function logNetworkActivity(entry) {
  return NetworkActivity.create({
    type: entry.type,
    method: entry.method ?? null,
    functionName: entry.functionName ?? null,
    txHash: entry.txHash ?? null,
    blockNumber: entry.blockNumber ?? null,
    fromAddress: entry.fromAddress ?? null,
    toAddress: entry.toAddress ?? null,
    gasUsed: entry.gasUsed ?? null,
    status: entry.status ?? null,
    reason: entry.reason ?? null,
    payload: entry.payload ?? null,
  });
}

export async function getNetworkActivities() {
  return NetworkActivity.findAll({
    order: [["createdAt", "DESC"]],
    limit: 200,
  });
}