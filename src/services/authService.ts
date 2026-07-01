// authService.ts
// All the functions for talking to the backend's auth endpoints:
// register a customer, register a vendor, log in, and log out.

import client from '../store/api/client';
import { LocalStorageService } from './storage/LocalStorageService';

// ── TYPE DEFINITIONS ──
// These describe the shape of the data going in and coming out of each function.

// Data needed to sign up a new customer.
export interface CustomerRegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  address?: string;
}

// Data needed to sign up a new vendor.
export interface VendorRegisterInput {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  businessAddress: string;
  city: string;
  latitude?: number;
  longitude?: number;
  agreedToPolicy: boolean;
  verificationDoc?: File;
}

// Data needed to log in (same fields for both buyers and sellers).
export interface LoginInput {
  email: string;
  password: string;
}

// Shape of the user object the backend sends back after login/register.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;    // "buyer" | "seller"
  status: string;  // "ACTIVE" | "SUSPENDED"
  phone?: string;
  city?: string;
  address?: string;
}

// Shape of the seller's business profile the backend sends back (null for buyers).
export interface SellerProfile {
  id: string;
  businessName: string;
  businessAddress: string;
}

// The full response the backend sends back after a successful login.
export interface AuthResponse {
  token: string;
  user: AuthUser;
  profile: SellerProfile | null;
  redirectTo: string;
}

// Response when registration is submitted but awaiting admin approval (no token yet).
export interface PendingRegistrationResponse {
  message: string;
  user: AuthUser;
}

// ── FUNCTIONS ──

// Sends customer registration data to the backend. No token until admin approves.
export const registerCustomer = async (
  input: CustomerRegisterInput
): Promise<PendingRegistrationResponse> => {
  const { data } = await client.post<PendingRegistrationResponse>(
    '/auth/customer/register',
    input
  );
  return data;
};

// Sends login credentials to the backend for both buyers and sellers.
// Saves the token and returns the full response (including where to redirect the user).
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', input);
  LocalStorageService.set('fr_token', data.token);
  return data;
};

// Sends vendor registration data to the backend. No token until admin approves.
export const registerVendor = async (
  input: VendorRegisterInput
): Promise<PendingRegistrationResponse> => {
  const payload = {
    businessName:    input.businessName,
    ownerName:       input.ownerName,
    email:           input.email,
    password:        input.password,
    confirmPassword: input.confirmPassword,
    businessAddress: input.businessAddress,
    city:            input.city,
    agreedToPolicy:  input.agreedToPolicy,
    phone:           input.phone,
    latitude:        input.latitude,
    longitude:       input.longitude,
  };

  const { data } = await client.post<PendingRegistrationResponse>(
    '/auth/vendor/signup',
    payload
  );
  return data;
};

// Logs the user out by removing the saved token from localStorage.
// No backend call needed — just clearing local storage is enough.
export const logoutUser = () => {
  LocalStorageService.remove('fr_token');
};