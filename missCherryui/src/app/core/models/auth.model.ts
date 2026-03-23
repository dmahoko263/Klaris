export type UserRole =
  | 'admin'
  | 'manufacturer'
  | 'distributor'
  | 'pharmacy'
  | 'patient';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  walletAddress?: string;
  organizationName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  user: AuthUser;
}