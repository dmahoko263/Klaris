import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface RegisterBatchPayload {
  batchId: number;
  drugName: string;
  manufacturerName: string;
  manufactureDate: number;
  expiryDate: number;
  metadataURI?: string;
}


export interface TransferBatchPayload {
  batchId: number;
  newOwner: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PharmaService {
  private http = inject(HttpClient);
  uploadMetadata(metadata: any): Observable<string> {
    return this.http.post(`${environment.apiUrl}/pharma/metadata/upload`, metadata, {
      responseType: 'text', // assuming backend returns plain IPFS URI
    });
  }
  grantManufacturer(account: string) {
    return this.http.post(`${environment.apiUrl}/pharma/roles/manufacturer`, { account });
  }

  grantDistributor(account: string) {
    return this.http.post(`${environment.apiUrl}/pharma/roles/distributor`, { account });
  }

  grantPharmacy(account: string) {
    return this.http.post(`${environment.apiUrl}/pharma/roles/pharmacy`, { account });
  }

  registerBatch(payload: RegisterBatchPayload) {
    return this.http.post(`${environment.apiUrl}/pharma/batches`, payload);
  }

  getBatch(batchId: number | string) {
    return this.http.get(`${environment.apiUrl}/pharma/batches/${batchId}`);
  }

  verifyBatch(batchId: number | string) {
    return this.http.get(`${environment.apiUrl}/pharma/batches/${batchId}/verify`);
  }

  verifyAndLog(batchId: number | string, note?: string) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/${batchId}/verify-log`, {
      note: note ?? '',
    });
  }

  transferOwnership(payload: TransferBatchPayload) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/transfer`, payload);
  }

  markDelivered(batchId: number | string) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/${batchId}/deliver`, {});
  }

  recallBatch(batchId: number | string, reason: string) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/${batchId}/recall`, { reason });
  }

  getOwnershipHistory(batchId: number | string) {
    return this.http.get(`${environment.apiUrl}/pharma/batches/${batchId}/ownership-history`);
  }

  getVerificationHistory(batchId: number | string) {
    return this.http.get(`${environment.apiUrl}/pharma/batches/${batchId}/verification-history`);
  }

  getVerificationStats(batchId: number | string) {
    return this.http.get(`${environment.apiUrl}/pharma/batches/${batchId}/verification-stats`);
  }

  flagSuspicious(batchId: number | string, reason: string) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/${batchId}/flag-suspicious`, {
      reason,
    });
  }

  clearSuspicious(batchId: number | string) {
    return this.http.post(`${environment.apiUrl}/pharma/batches/${batchId}/clear-suspicious`, {});
  }

  getAllBatches() {
  return this.http.get<any[]>(`${environment.apiUrl}/pharma/batches`);
}

getBatchCount() {
  return this.http.get<{ count: number }>(`${environment.apiUrl}/pharma/batches/count`);
}
}