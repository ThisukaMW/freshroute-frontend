import apiClient from '../client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  buyer?: {
    id: string
    name: string
    email: string
    deliveryAddress?: string
  }
  seller?: {
    id: string
    name: string
    email: string
    businessName?: string
    businessAddress?: string
  }
  driver?: {
    id: string
    name: string
    email: string
    vehicleNumber?: string
    vehicleType?: string
  }
}

export const buyerLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('🔐 Logging in buyer...', email)
    const response = await apiClient.post('/api/v1/auth/buyer/login', {
      email,
      password,
    })
    console.log('✅ Login successful')
    return response.data
  } catch (error) {
    console.error('❌ Login failed:', error)
    throw error
  }
}

export const sellerLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('🔐 Logging in seller...', email)
    const response = await apiClient.post('/api/v1/auth/seller/login', {
      email,
      password,
    })
    console.log('✅ Login successful')
    return response.data
  } catch (error) {
    console.error('❌ Login failed:', error)
    throw error
  }
}

export const driverLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('🔐 Logging in driver...', email)
    const response = await apiClient.post('/api/v1/auth/driver/login', {
      email,
      password,
    })
    console.log('✅ Login successful')
    return response.data
  } catch (error) {
    console.error('❌ Login failed:', error)
    throw error
  }
}
