import apiClient from '../../store/api/client'

// ============= TYPES =============

export interface StockHistoryEntry {
  id: string
  type: 'INITIAL' | 'PURCHASE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  orderId?: string
  createdAt: string
}

// export interface ProductInventory {
//   id: string
//   name: string
//   category: string
//   price: number
//   stock: number
//   lowStock: number
//   status: string
//   unit?: string
//   description?: string | null
//   imageUrl?: string | null
//   stockHistory: StockHistoryEntry[]
// }

export interface ProductInventory {
  id: string
  name: string
  sellerStock: number
  aggregateStock: number
  lowStockThreshold: number
  status: string // or your Status enum
}

export interface InventoryStats {
  totalSkus: number
  totalUnits: number
  lowStockItems: number
  outOfStockItems: number
}

export interface RestockSuggestion {
  productId: string
  productName: string
  currentStock: number
  lowStockThreshold: number
  recommendedQuantity: number
  reason: string
  priority: 'critical' | 'high' | 'medium'
}

export interface CartValidationResult {
  isValid: boolean
  issues: Array<{
    productId: string
    requested: number
    available: number
  }>
}

// ============= SELLER ENDPOINTS =============

/**
 * GET /inventory/seller
 * Get all seller's products with inventory details
 */
export const getSellerInventory = async (): Promise<ProductInventory[]> => {
  try {
    console.log('🔄 Fetching seller inventory...')
    const response = await apiClient.get('/inventory/seller')
    console.log('✅ Seller inventory loaded:', response.data)
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch seller inventory:', error)
    throw error
  }
}

/**
 * GET /inventory/stats
 * Get inventory dashboard statistics
 */
export const getInventoryStats = async (): Promise<InventoryStats> => {
  try {
    console.log('🔄 Fetching inventory stats...')
    const response = await apiClient.get('/inventory/stats')
    console.log('✅ Inventory stats loaded:', response.data)
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to fetch inventory stats:', error)
    throw error
  }
}

/**
 * GET /inventory/low-stock
 * Get all low-stock products for seller
 */
export const getLowStockProducts = async (): Promise<ProductInventory[]> => {
  try {
    console.log('🔄 Fetching low-stock products...')
    const response = await apiClient.get('/inventory/low-stock')
    console.log('✅ Low-stock products loaded:', response.data)
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch low-stock products:', error)
    throw error
  }
}

/**
 * GET /inventory/suggestions
 * Get restock recommendations
 */
export const getRestockSuggestions = async (): Promise<RestockSuggestion[]> => {
  try {
    console.log('🔄 Fetching restock suggestions...')
    const response = await apiClient.get('/inventory/suggestions')
    console.log('✅ Restock suggestions loaded:', response.data)
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch restock suggestions:', error)
    throw error
  }
}

/**
 * POST /inventory/restock
 * Manually add stock to a product
 */
export const restockProduct = async (
  productId: string,
  quantity: number,
  reason?: string
): Promise<{ product: any; history: StockHistoryEntry }> => {
  try {
    console.log(`🔄 Restocking product ${productId} with ${quantity} units...`)
    const response = await apiClient.post('/inventory/restock', {
      productId,
      quantity,
      reason: reason || 'Manual restock',
    })
    console.log('✅ Product restocked:', response.data)
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to restock product:', error)
    throw error
  }
}

// ============= PUBLIC ENDPOINTS (No Auth) =============

/**
 * GET /inventory/:productId
 * Get stock details for a single product
 */
export const getProductStock = async (productId: string): Promise<ProductInventory> => {
  try {
    console.log(`🔄 Fetching stock for product ${productId}...`)
    const response = await apiClient.get(`/inventory/${productId}`)
    console.log('✅ Product stock loaded:', response.data)
    return response.data.data
  } catch (error) {
    console.error(`❌ Failed to fetch product stock:`, error)
    throw error
  }
}

/**
 * GET /inventory/:productId/history
 * Get complete stock history for a product
 */
export const getProductStockHistory = async (
  productId: string,
  limit = 50
): Promise<StockHistoryEntry[]> => {
  try {
    console.log(`🔄 Fetching stock history for product ${productId}...`)
    const response = await apiClient.get(`/inventory/${productId}/history`, {
      params: { limit },
    })
    console.log('✅ Stock history loaded:', response.data)
    return response.data.data || []
  } catch (error) {
    console.error(`❌ Failed to fetch stock history:`, error)
    throw error
  }
}

/**
 * POST /inventory/validate-cart
 * Validate if cart items are in stock
 */
export const validateCartStock = async (
  cartItems: Array<{ productId: string; quantity: number }>
): Promise<CartValidationResult> => {
  try {
    console.log('🔄 Validating cart stock...')
    const response = await apiClient.post('/inventory/validate-cart', {
      cartItems,
    })
    console.log('✅ Cart stock validation result:', response.data)
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to validate cart stock:', error)
    throw error
  }
}
