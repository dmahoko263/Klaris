import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'mc_token';
  private readonly USER_KEY = 'mc_user';

  private currentUserSignal = signal<AuthUser | null>(this.getStoredUser());

  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => !!this.currentUserSignal());
  userRole = computed(() => this.currentUserSignal()?.role ?? null);

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`,
      payload
    );
  }

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      payload
    );
  }

  saveSession(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  getMe() {
    return this.currentUser;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}