import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface WalletRolePayload {
  walletAddress: string;
  role: 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'patient';
}

@Injectable({
  providedIn: 'root',
})
export class WalletRoleService {
  private http = inject(HttpClient);

  createOrUpdate(payload: WalletRolePayload) {
    return this.http.post(`${environment.apiUrl}/wallet-roles`, payload);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/wallet-roles`);
  }

  getOne(walletAddress: string) {
    return this.http.get(`${environment.apiUrl}/wallet-roles/${walletAddress}`);
  }

  deactivate(walletAddress: string) {
    return this.http.patch(`${environment.apiUrl}/wallet-roles/${walletAddress}/deactivate`, {});
  }

  delete(walletAddress: string) {
    return this.http.delete(`${environment.apiUrl}/wallet-roles/${walletAddress}`);
  }
}