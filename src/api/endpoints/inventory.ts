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

export interface ProductInventory {
  id: string
  name: string
  sellerStock: number
  aggregateStock: number
  lowStockThreshold: number
  status: string
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

export const getSellerInventory = async (): Promise<ProductInventory[]> => {
  try {
    const response = await apiClient.get('/inventory/seller')
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch seller inventory:', error)
    throw error
  }
}

export const getInventoryStats = async (): Promise<InventoryStats> => {
  try {
    const response = await apiClient.get('/inventory/stats')
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to fetch inventory stats:', error)
    throw error
  }
}

export const getLowStockProducts = async (): Promise<ProductInventory[]> => {
  try {
    const response = await apiClient.get('/inventory/low-stock')
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch low-stock products:', error)
    throw error
  }
}

/**
 * GET /inventory/out-of-stock
 * Products where seller's stock === 0
 */
export const getOutOfStockProducts = async (): Promise<ProductInventory[]> => {
  try {
    const response = await apiClient.get('/inventory/out-of-stock')
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch out-of-stock products:', error)
    throw error
  }
}

/**
 * GET /inventory/out-of-stock/count
 * Just the number — for dashboard badge
 */
export const getOutOfStockCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get('/inventory/out-of-stock/count')
    return response.data.count ?? 0
  } catch (error) {
    console.error('❌ Failed to fetch out-of-stock count:', error)
    throw error
  }
}

export const getRestockSuggestions = async (): Promise<RestockSuggestion[]> => {
  try {
    const response = await apiClient.get('/inventory/suggestions')
    return response.data.data || []
  } catch (error) {
    console.error('❌ Failed to fetch restock suggestions:', error)
    throw error
  }
}

export const restockProduct = async (
  productId: string,
  quantity: number,
  reason?: string
): Promise<{ product: any; history: StockHistoryEntry }> => {
  try {
    const response = await apiClient.post('/inventory/restock', {
      productId,
      quantity,
      reason: reason || 'Manual restock',
    })
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to restock product:', error)
    throw error
  }
}

// ============= PUBLIC ENDPOINTS =============

export const getProductStock = async (productId: string): Promise<ProductInventory> => {
  try {
    const response = await apiClient.get(`/inventory/${productId}`)
    return response.data.data
  } catch (error) {
    console.error(`❌ Failed to fetch product stock:`, error)
    throw error
  }
}

export const getProductStockHistory = async (
  productId: string,
  limit = 50
): Promise<StockHistoryEntry[]> => {
  try {
    const response = await apiClient.get(`/inventory/${productId}/history`, { params: { limit } })
    return response.data.data || []
  } catch (error) {
    console.error(`❌ Failed to fetch stock history:`, error)
    throw error
  }
}

export const validateCartStock = async (
  cartItems: Array<{ productId: string; quantity: number }>
): Promise<CartValidationResult> => {
  try {
    const response = await apiClient.post('/inventory/validate-cart', { cartItems })
    return response.data.data
  } catch (error) {
    console.error('❌ Failed to validate cart stock:', error)
    throw error
  }
}