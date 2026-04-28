import { Injectable, inject } from '@angular/core';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import { WalletService } from './wallet.service';
import {
  PHARMA_CONTRACT_ABI,
  PHARMA_CONTRACT_ADDRESS,
} from '../blockchain/pharma-contract';

export interface RegisterBatchTxPayload {
  batchId: string | number;
  drugName: string;
  manufacturerName: string;
  manufactureDate: number | string;
  expiryDate: number | string;
  metadataURI?: string;
}

export interface TransferBatchTxPayload {
  batchId: string | number;
  newOwner: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PharmaWeb3Service {
  private wallet = inject(WalletService);

  private readonly rpcUrl = 'http://127.0.0.1:8545';

private toBigIntSafe(value: string | number): bigint {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    throw new Error('Batch ID is required');
  }

  // ðŸš¨ block scientific notation
  if (/e\+|e-/i.test(normalized)) {
    throw new Error('Invalid batch ID: scientific notation not allowed');
  }

  // ðŸš¨ only digits allowed
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Batch ID must be a numeric string');
  }

  try {
    return BigInt(normalized);
  } catch {
    throw new Error('Invalid batch ID format');
  }
}

  private toUintSafe(value: string | number, label: string): bigint {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      throw new Error(`${label} is required`);
    }

    try {
      return BigInt(normalized);
    } catch {
      throw new Error(`Invalid ${label} format`);
    }
  }

  private normalizeVerifyResult(result: any) {
    return {
      valid: result?.[0],
      reason: result?.[1],
      drugName: result?.[2],
      manufacturerName: result?.[3],
      manufactureDate: result?.[4]?.toString?.() ?? '0',
      expiryDate: result?.[5]?.toString?.() ?? '0',
      manufacturer: result?.[6],
      currentOwner: result?.[7],
      status: Number(result?.[8] ?? 0),
      suspicious: !!result?.[9],
      verificationCount: result?.[10]?.toString?.() ?? '0',
    };
  }

  private normalizeBatchStruct(batch: any) {
    return {
      batchId: batch?.batchId?.toString?.() ?? '',
      drugName: batch?.drugName ?? '',
      manufacturerName: batch?.manufacturerName ?? '',
      manufactureDate: batch?.manufactureDate?.toString?.() ?? '0',
      expiryDate: batch?.expiryDate?.toString?.() ?? '0',
      metadataURI: batch?.metadataURI ?? '',
      manufacturer: batch?.manufacturer ?? '',
      currentOwner: batch?.currentOwner ?? '',
      status: Number(batch?.status ?? 0),
      exists: !!batch?.exists,
      suspicious: !!batch?.suspicious,
      verificationCount: batch?.verificationCount?.toString?.() ?? '0',
      uniqueVerifierCount: batch?.uniqueVerifierCount?.toString?.() ?? '0',
      createdAt: batch?.createdAt?.toString?.() ?? '0',
    };
  }

  private normalizeOwnershipHistory(items: any[]) {
    return (items || []).map((item) => ({
      from: item?.from ?? '',
      to: item?.to ?? '',
      timestamp: item?.timestamp?.toString?.() ?? '0',
      note: item?.note ?? '',
    }));
  }

  private normalizeVerificationHistory(items: any[]) {
    return (items || []).map((item) => ({
      verifier: item?.verifier ?? '',
      timestamp: item?.timestamp?.toString?.() ?? '0',
      validAtScan: !!item?.validAtScan,
      note: item?.note ?? '',
    }));
  }

  private getReadOnlyContract(): Contract {
    const provider = new JsonRpcProvider(this.rpcUrl);

    return new Contract(
      PHARMA_CONTRACT_ADDRESS,
      PHARMA_CONTRACT_ABI,
      provider
    );
  }

  private async getWriteContract(forceSelect = false): Promise<Contract> {
    await this.wallet.switchToHardhat();

    if (!this.wallet.isConnected()) {
      await this.wallet.connectWallet(forceSelect);
    }

    const signer = await this.wallet.getSigner();

    return new Contract(
      PHARMA_CONTRACT_ADDRESS,
      PHARMA_CONTRACT_ABI,
      signer
    );
  }

  async registerBatch(payload: RegisterBatchTxPayload) {
    const contract = await this.getWriteContract();

    const tx = await contract['registerBatch'](
      this.toBigIntSafe(payload.batchId),
      payload.drugName,
      payload.manufacturerName,
      this.toUintSafe(payload.manufactureDate, 'manufacture date'),
      this.toUintSafe(payload.expiryDate, 'expiry date'),
      payload.metadataURI || ''
    );

    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: String(payload.batchId),
      from: tx.from,
    };
  }

  async transferOwnership(payload: TransferBatchTxPayload) {
    const contract = await this.getWriteContract();

    const tx = await contract['transferOwnership'](
      this.toBigIntSafe(payload.batchId),
      ethers.getAddress(payload.newOwner),
      payload.note || ''
    );

    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: String(payload.batchId),
      from: tx.from,
    };
  }

  async markDelivered(batchId: string | number) {
    const contract = await this.getWriteContract();

    const tx = await contract['markDelivered'](this.toBigIntSafe(batchId));
    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: String(batchId),
      from: tx.from,
    };
  }

  async recallBatch(batchId: string | number, reason: string) {
    const contract = await this.getWriteContract();

    const tx = await contract['recallBatch'](
      this.toBigIntSafe(batchId),
      reason || ''
    );

    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      batchId: String(batchId),
      from: tx.from,
    };
  }

  async addManufacturer(account: string) {
    const contract = await this.getWriteContract();

    const normalized = ethers.getAddress(account);
    const tx = await contract['addManufacturer'](normalized);
    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: normalized,
      from: tx.from,
    };
  }

  async addDistributor(account: string) {
    const contract = await this.getWriteContract();

    const normalized = ethers.getAddress(account);
    const tx = await contract['addDistributor'](normalized);
    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: normalized,
      from: tx.from,
    };
  }

  async addPharmacy(account: string) {
    const contract = await this.getWriteContract();

    const normalized = ethers.getAddress(account);
    const tx = await contract['addPharmacy'](normalized);
    const receipt = await tx.wait();

    return {
      ok: true,
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      account: normalized,
      from: tx.from,
    };
  }

  async grantRole(
    role: 'manufacturer' | 'distributor' | 'pharmacy',
    account: string
  ) {
    if (role === 'manufacturer') return this.addManufacturer(account);
    if (role === 'distributor') return this.addDistributor(account);
    if (role === 'pharmacy') return this.addPharmacy(account);

    throw new Error('Invalid role');
  }
async verifyPublic(batchId: string | number) {
  try {
    return await this.verifyBatchRead(batchId);
  } catch (error: any) {
    throw new Error(
      error?.message || 'Failed to verify batch. Please check the ID.'
    );
  }
}
  async getConnectedWalletRoleStatus() {
    const contract = await this.getWriteContract();

    const signer = await this.wallet.getSigner();
    const account = await signer.getAddress();

    const [manufacturerRole, distributorRole, pharmacyRole, adminRole] =
      await Promise.all([
        contract['MANUFACTURER_ROLE'](),
        contract['DISTRIBUTOR_ROLE'](),
        contract['PHARMACY_ROLE'](),
        contract['DEFAULT_ADMIN_ROLE'](),
      ]);

    const [isManufacturer, isDistributor, isPharmacy, isAdmin] =
      await Promise.all([
        contract['hasRole'](manufacturerRole, account),
        contract['hasRole'](distributorRole, account),
        contract['hasRole'](pharmacyRole, account),
        contract['hasRole'](adminRole, account),
      ]);

    return {
      account,
      isManufacturer: !!isManufacturer,
      isDistributor: !!isDistributor,
      isPharmacy: !!isPharmacy,
      isAdmin: !!isAdmin,
    };
  }

  async verifyBatchRead(batchId: string | number) {
    const contract = this.getReadOnlyContract();
    const result = await contract['verifyBatch'](this.toBigIntSafe(batchId));
    return this.normalizeVerifyResult(result);
  }

  async getBatch(batchId: string | number) {
    const contract = this.getReadOnlyContract();
    const result = await contract['getBatch'](this.toBigIntSafe(batchId));
    return this.normalizeBatchStruct(result);
  }

  async getOwnershipHistory(batchId: string | number) {
    const contract = this.getReadOnlyContract();
    const result = await contract['getOwnershipHistory'](this.toBigIntSafe(batchId));
    return this.normalizeOwnershipHistory(result);
  }

  async getVerificationHistory(batchId: string | number) {
    const contract = this.getReadOnlyContract();
    const result = await contract['getVerificationHistory'](this.toBigIntSafe(batchId));
    return this.normalizeVerificationHistory(result);
  }

  async getVerificationStats(batchId: string | number) {
    const contract = this.getReadOnlyContract();
    const result = await contract['getVerificationStats'](this.toBigIntSafe(batchId));

    return {
      totalVerifications: result?.[0]?.toString?.() ?? '0',
      uniqueVerifiers: result?.[1]?.toString?.() ?? '0',
      isSuspicious: !!result?.[2],
    };
  }

  async getBatchCount() {
    const contract = this.getReadOnlyContract();

    try {
      const count = await contract['batchCount']();
      return Number(count);
    } catch {
      const count = await contract['getBatchCount']();
      return Number(count);
    }
  }

async getAllBatches() {
  const contract = this.getReadOnlyContract();

  try {
    // safer filter
    const filter =
      contract.filters?.['BatchRegistered']?.() || 'BatchRegistered';

    const events = await contract.queryFilter(filter);

    const batches = [];

    for (const event of events as any[]) {
      const args = event?.args;
      if (!args || !args[0]) continue;

      const batchId = args[0].toString();

      try {
        const batch = await this.getBatch(batchId);
        batches.push(batch);
      } catch {
        // skip broken
      }
    }

    return batches;
  } catch (error) {
    console.error('GET_ALL_BATCHES_ERROR:', error);
    return [];
  }
}

  /**
   * Optional only.
   * Use this only if your contract really allows public verification logging.
   * For public QR verification, prefer backend/API verification instead.
   */
 async verifyAndLog(batchId: string | number, note?: string) {
  const contract = await this.getWriteContract();

  const tx = await contract['verifyAndLog'](
    this.toBigIntSafe(batchId),
    note || 'Verified from MetaMask'
  );

  const receipt = await tx.wait();

  return {
    ok: true,
    txHash: receipt?.hash ?? tx.hash,
    blockNumber: receipt?.blockNumber ?? null,
    batchId: String(batchId),
    from: tx.from,
  };
}
}