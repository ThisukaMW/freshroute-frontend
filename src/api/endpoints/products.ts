import apiClient from '../../store/api/client'
import type { ProductInventory } from './inventory'

export interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  stock: number
  status: string
  imageUrl?: string 
  description?: string
}

/**
 * Fetch all products from backend
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔄 Fetching products from backend...')
    const response = await apiClient.get('/products')
    console.log('✅ Products fetched:', response.data)
    return response.data || []
  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    throw error
  }
}

/**
 * Fetch product by ID
 */
export const getProductById = async (productId: string): Promise<Product> => {
  try {
    console.log(`🔄 Fetching product ${productId}...`)
    const response = await apiClient.get(`/products/${productId}`)
    console.log('✅ Product fetched:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch product ${productId}:`, error)
    throw error
  }
}

/**
 * Fetch all sellers offering a specific product
 */
export const getProductBySellers = async (productId: string): Promise<Product[]> => {
  try {
    console.log(`🔄 Fetching sellers for product ${productId}...`)
    const response = await apiClient.get(`/products/${productId}/sellers`)
    console.log('✅ Sellers fetched:', response.data)
    return response.data || []
  } catch (error) {
    console.error(`❌ Failed to fetch sellers for product ${productId}:`, error)
    throw error
  }
}

/**
 * Create a new product for seller
 */
export const createSellerProduct = async (productData: any): Promise<Product> => {
  try {
    const response = await apiClient.post('/products/add', productData);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create product:', error);
    throw error;
  }
}

/**
 * Update seller product - only price, stock, imageUrl are editable
 */
export const updateSellerProduct = async (productId: string, productData: any): Promise<any> => {
  try {
    console.log(`🔄 Updating product ${productId}...`, productData)
    const response = await apiClient.patch(`/products/${productId}`, productData)
    console.log('✅ Product updated:', response.data)
    // Response structure: { message, data: { id, name, sellerPrice, sellerStock, ... } }
    return response.data?.data || response.data
  } catch (error) {
    console.error(`❌ Failed to update product ${productId}:`, error)
    throw error
  }
}

/**
 * Get all products for logged-in seller
 */
export const getSellerProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔄 Fetching seller products...')
    const response = await apiClient.get('/products/seller/my-products')
    console.log('✅ Seller products fetched:', response.data)
    return response.data?.data || []
  } catch (error) {
    console.error('❌ Failed to fetch seller products:', error)
    throw error
  }
}

/**
 * Get product by ID for seller
 */
export const getSellerProductById = async (productId: string): Promise<Product> => {
  try {
    console.log(`🔄 Fetching seller product ${productId}...`)
    const response = await apiClient.get(`/products/${productId}`)
    console.log('✅ Seller product fetched:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch seller product:`, error)
    throw error
  }
}


