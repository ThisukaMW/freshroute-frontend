import apiClient from '../client'

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
    const response = await apiClient.get('/api/v1/products')
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
    const response = await apiClient.get(`/api/v1/products/${productId}`)
    console.log('✅ Product fetched:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch product ${productId}:`, error)
    throw error
  }
}
