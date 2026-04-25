/*import client from '../store/api/client'
import { LocalStorageService } from './storage/LocalStorageService'

// ── TYPES ──

export interface CustomerRegisterInput {
  name: string
  email: string
  password: string
  phone?: string
  city?: string
  address?: string
}

export interface CustomerLoginInput {
  email: string
  password: string
}

export interface VendorRegisterInput {
  businessName: string
  ownerName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  businessAddress: string
  city: string
  latitude?: number
  longitude?: number
  agreedToPolicy: boolean
  verificationDoc?: File
}

export interface VendorLoginInput {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  city?: string
  address?: string
  sellerProfile?: {
    id: string
    businessName: string
    businessAddress: string
  }
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

// ── CUSTOMER ──

export const registerCustomer = async (input: CustomerRegisterInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/customer/register', input)
  LocalStorageService.set('fr_token', data.token)
  return data
}

export const loginCustomer = async (input: CustomerLoginInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/customer/login', input)
  LocalStorageService.set('fr_token', data.token)
  return data
}

// ── VENDOR ──

export const registerVendor = async (input: VendorRegisterInput): Promise<AuthResponse> => {
  const formData = new FormData()
  formData.append('businessName', input.businessName)
  formData.append('ownerName', input.ownerName)
  formData.append('email', input.email)
  formData.append('password', input.password)
  formData.append('confirmPassword', input.confirmPassword)
  formData.append('businessAddress', input.businessAddress)
  formData.append('city', input.city)
  formData.append('agreedToPolicy', String(input.agreedToPolicy))
  if (input.phone) formData.append('phone', input.phone)
  if (input.latitude) formData.append('latitude', String(input.latitude))
  if (input.longitude) formData.append('longitude', String(input.longitude))
  if (input.verificationDoc) formData.append('verificationDoc', input.verificationDoc)

  const { data } = await client.post<AuthResponse>('/auth/vendor/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  LocalStorageService.set('fr_token', data.token)
  return data
}

export const loginVendor = async (input: VendorLoginInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/vendor/login', input)
  LocalStorageService.set('fr_token', data.token)
  return data
}

// ── LOGOUT ──

export const logoutUser = () => {
  LocalStorageService.remove('fr_token')
}*/
import client from '../store/api/client'
import { LocalStorageService } from './storage/LocalStorageService'

// ── TYPES ──

export interface CustomerRegisterInput {
  name: string
  email: string
  password: string
  phone?: string
  city?: string
  address?: string
}

export interface VendorRegisterInput {
  businessName: string
  ownerName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  businessAddress: string
  city: string
  latitude?: number
  longitude?: number
  agreedToPolicy: boolean
  verificationDoc?: File
}

// ── unified login input (same fields for both) ──
export interface LoginInput {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string        // "buyer" | "seller"
  status: string      // "ACTIVE" | "SUSPENDED"
  phone?: string
  city?: string
  address?: string
}

export interface SellerProfile {
  id: string
  businessName: string
  businessAddress: string
}

// ── updated response shape to match backend ──
export interface AuthResponse {
  token: string
  user: AuthUser
  profile: SellerProfile | null   // null for buyers, sellerProfile for sellers
  redirectTo: string              // "/buyer/:id/dashboard" or "/seller/:id/dashboard"
}

// ── CUSTOMER REGISTER ──

export const registerCustomer = async (input: CustomerRegisterInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/customer/register', input)
  LocalStorageService.set('fr_token', data.token)
  return data
}

// ── UNIFIED LOGIN (buyer + seller) ──

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', input)  // ✅ new route
  LocalStorageService.set('fr_token', data.token)
  return data
}

// ── VENDOR REGISTER ──

export const registerVendor = async (input: VendorRegisterInput): Promise<AuthResponse> => {
  const formData = new FormData()
  formData.append('businessName', input.businessName)
  formData.append('ownerName', input.ownerName)
  formData.append('email', input.email)
  formData.append('password', input.password)
  formData.append('confirmPassword', input.confirmPassword)
  formData.append('businessAddress', input.businessAddress)
  formData.append('city', input.city)
  formData.append('agreedToPolicy', String(input.agreedToPolicy))
  if (input.phone) formData.append('phone', input.phone)
  if (input.latitude) formData.append('latitude', String(input.latitude))
  if (input.longitude) formData.append('longitude', String(input.longitude))
  if (input.verificationDoc) formData.append('verificationDoc', input.verificationDoc)

  const { data } = await client.post<AuthResponse>('/auth/vendor/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  LocalStorageService.set('fr_token', data.token)
  return data
}

// ── LOGOUT ──

export const logoutUser = () => {
  LocalStorageService.remove('fr_token')
}