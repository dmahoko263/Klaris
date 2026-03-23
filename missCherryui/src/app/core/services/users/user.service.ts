import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<{ users: any[] }>(`${environment.apiUrl}/users`);
  }

  updateWallet(id: string, walletAddress: string) {
    return this.http.patch(`${environment.apiUrl}/users/${id}/wallet`, { walletAddress });
  }

  toggleActive(id: string) {
    return this.http.patch(`${environment.apiUrl}/users/${id}/toggle-active`, {});
  }
}