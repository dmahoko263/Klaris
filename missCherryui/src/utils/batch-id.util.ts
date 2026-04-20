import { ethers } from 'ethers';

export function generateBatchId(params: {
  drugName: string;
  manufacturerWallet: string;
  manufactureDate: number;
  expiryDate: number;
  metadataURI?: string;
}): string {
  const nonce = Date.now();

  const hash = ethers.keccak256(
    ethers.solidityPacked(
      ['string', 'address', 'uint256', 'uint256', 'string', 'uint256'],
      [
        params.drugName.trim(),
        params.manufacturerWallet,
        params.manufactureDate,
        params.expiryDate,
        params.metadataURI || '',
        nonce,
      ]
    )
  );

  return BigInt(hash).toString();
}

export function shortBatchLabel(batchId: string | number): string {
  const raw = String(batchId);
  return `BATCH-${raw.slice(-12).toUpperCase()}`;
}