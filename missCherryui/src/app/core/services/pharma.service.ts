import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterBatchPayload {
  batchId: number;
  drugName: string;
  manufacturerName: string;
  manufactureDate: number; // Unix timestamp
  expiryDate: number; // Unix timestamp
  metadataURI?: string;
}

export interface TransferBatchPayload {
  batchId: number;
  newOwner: string;
  note?: string;
}
export interface ApiResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
  data?: any;
}

export interface BatchRecord {
  batchId: number;
  drugName: string;
  manufacturerName: string;
  manufactureDate: number;
  expiryDate: number;
  currentOwner?: string;
  metadataURI?: string;
  status?: number | string;
  isDelivered?: boolean;
  isRecalled?: boolean;
  isSuspicious?: boolean;
  recallReason?: string;
  verificationCount?: number;
  uniqueVerifierCount?: number;
  createdAt?: number;
}

export interface OwnershipHistoryRecord {
  batchId: number;
  previousOwner: string;
  newOwner: string;
  transferredAt: number;
  note?: string;
  transactionHash?: string;
}

export interface VerificationHistoryRecord {
  batchId: number;
  verifiedBy?: string;
  verifiedAt: number;
  status?: string;
  note?: string;
  location?: string;
  transactionHash?: string;
}

export interface VerificationStats {
  batchId: number;
  totalVerifications: number;
  suspiciousFlags: number;
  lastVerifiedAt?: number;
}

export interface BatchCountResponse {
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class PharmaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pharma`;


  grantManufacturer(account: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/roles/manufacturer`, {
      account,
    });
  }

  grantDistributor(account: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/roles/distributor`, {
      account,
    });
  }

  grantPharmacy(account: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/roles/pharmacy`, {
      account,
    });
  }

  registerBatch(payload: RegisterBatchPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/batches`, payload);
  }

  getAllBatches(): Observable<BatchRecord[]> {
    return this.http.get<BatchRecord[]>(`${this.baseUrl}/batches`);
  }

  getBatch(batchId: number | string): Observable<BatchRecord> {
    return this.http.get<BatchRecord>(`${this.baseUrl}/batches/${batchId}`);
  }

  getBatchCount(): Observable<BatchCountResponse> {
    return this.http.get<BatchCountResponse>(`${this.baseUrl}/batches/count`);
  }

  verifyBatch(batchId: number | string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/batches/${batchId}/verify`);
  }

  verifyAndLog(batchId: number | string, note?: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/batches/${batchId}/verify-log`, {
      note: note ?? '',
    });
  }

  transferOwnership(payload: TransferBatchPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/batches/transfer`, payload);
  }

  markDelivered(batchId: number | string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/batches/${batchId}/deliver`, {});
  }

  recallBatch(batchId: number | string, reason: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/batches/${batchId}/recall`, {
      reason,
    });
  }

  getOwnershipHistory(batchId: number | string): Observable<OwnershipHistoryRecord[]> {
    return this.http.get<OwnershipHistoryRecord[]>(
      `${this.baseUrl}/batches/${batchId}/ownership-history`
    );
  }

  getVerificationHistory(batchId: number | string): Observable<VerificationHistoryRecord[]> {
    return this.http.get<VerificationHistoryRecord[]>(
      `${this.baseUrl}/batches/${batchId}/verification-history`
    );
  }

  getVerificationStats(batchId: number | string): Observable<VerificationStats> {
    return this.http.get<VerificationStats>(
      `${this.baseUrl}/batches/${batchId}/verification-stats`
    );
  }

  flagSuspicious(batchId: number | string, reason: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/batches/${batchId}/flag-suspicious`,
      { reason }
    );
  }

  clearSuspicious(batchId: number | string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/batches/${batchId}/clear-suspicious`,
      {}
    );
  }
  getNetworkActivities() {
  return this.http.get<{ ok: boolean; entries: any[] }>(
    `${environment.apiUrl}/network-activity`
  );
}
}