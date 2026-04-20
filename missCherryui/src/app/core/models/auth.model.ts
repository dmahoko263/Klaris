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
  address?: string;
  country?: string;
  website?: string;
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
  fullName?: string | null;
  phone?: string | null;
  organizationName?: string | null;
  address?: string | null;
  country?: string | null;
  website?: string | null;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  user: AuthUser;
}