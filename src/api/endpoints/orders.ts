import apiClient from '../client'

// ============= TYPES =============

export interface OrderItem {
  id: string
  productId: string
  sellerId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
    unit: string
    price: number
    category?: string
    imageUrl?: string
  }
}

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'READY_PICKUP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  deliveryAddress: string
  deliveryLat: number
  deliveryLng: number
  deliveryNotes?: string
  items: OrderItem[]
  buyer?: {
    id: string
    user: {
      name: string
      email?: string
      phone?: string
    }
    deliveryAddress: string
    latitude?: number
    longitude?: number
  }
  driver?: {
    user: {
      name: string
      phone: string
    }
  }
  payment?: {
    status: string
    amount: number
    currency: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface SellerStats {
  totalOrders: number
  ordersToday: number
  totalRevenue: number
  revenueToday: number
  ordersByStatus: Record<string, number>
}

export interface SellerOrdersResponse {
  success: boolean
  data: Order[]
  count: number
}

// ============= SELLER ORDERS ENDPOINTS =============

/**
 * GET /api/v1/orders/seller/list
 * Get all orders containing seller's products
 */
export const getSellerOrders = async (): Promise<Order[]> => {
  try {
    console.log('🔄 Fetching seller orders...')
    const response = await apiClient.get('/api/v1/orders/seller/list')
    console.log('✅ Seller orders fetched:', response.data)
    return response.data?.data || []
  } catch (error) {
    console.error('❌ Failed to fetch seller orders:', error)
    throw error
  }
}

/**
 * GET /api/v1/orders/seller/stats
 * Get seller dashboard statistics
 */
export const getSellerStats = async (): Promise<SellerStats> => {
  try {
    console.log('🔄 Fetching seller stats...')
    const response = await apiClient.get('/api/v1/orders/seller/stats')
    console.log('✅ Seller stats fetched:', response.data)
    return response.data?.data
  } catch (error) {
    console.error('❌ Failed to fetch seller stats:', error)
    throw error
  }
}

/**
 * GET /api/v1/orders/seller/:id
 * Get a specific order for seller verification
 */
export const getSellerOrderById = async (orderId: string): Promise<Order> => {
  try {
    console.log(`🔄 Fetching seller order ${orderId}...`)
    const response = await apiClient.get(`/api/v1/orders/seller/${orderId}`)
    console.log('✅ Seller order fetched:', response.data)
    return response.data?.data
  } catch (error) {
    console.error(`❌ Failed to fetch seller order:`, error)
    throw error
  }
}

// ============= BUYER ORDERS ENDPOINTS =============

/**
 * GET /api/v1/orders
 * Get buyer's orders
 */
export const getBuyerOrders = async (): Promise<Order[]> => {
  try {
    console.log('🔄 Fetching buyer orders...')
    const response = await apiClient.get('/api/v1/orders')
    console.log('✅ Buyer orders fetched:', response.data)
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('❌ Failed to fetch buyer orders:', error)
    throw error
  }
}

/**
 * GET /api/v1/orders/:id
 * Get a specific buyer order
 */
export const getBuyerOrderById = async (orderId: string): Promise<Order> => {
  try {
    console.log(`🔄 Fetching buyer order ${orderId}...`)
    const response = await apiClient.get(`/api/v1/orders/${orderId}`)
    console.log('✅ Buyer order fetched:', response.data)
    return response.data?.data || response.data
  } catch (error) {
    console.error(`❌ Failed to fetch buyer order:`, error)
    throw error
  }
}

/**
 * GET /api/v1/orders/addresses
 * Get buyer's saved addresses
 */
export const getBuyerAddresses = async (): Promise<any> => {
  try {
    console.log('🔄 Fetching buyer addresses...')
    const response = await apiClient.get('/api/v1/orders/addresses')
    console.log('✅ Buyer addresses fetched:', response.data)
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('❌ Failed to fetch buyer addresses:', error)
    throw error
  }
}

/**
 * POST /api/v1/orders
 * Create a new order (buyer)
 */
export const createOrder = async (
  items: Array<{ productId: string; quantity: number; sellerId: string }>,
  deliveryAddress: string,
  deliveryLat: number,
  deliveryLng: number,
  deliveryTimeSlot: "MORNING" | "AFTERNOON" | "EVENING",
  specialInstructions?: string
): Promise<Order> => {
  try {
    console.log('🔄 Creating order...', items)
    const response = await apiClient.post('/api/v1/orders', {
      items,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      deliveryTimeSlot,
      specialInstructions,
    })
    console.log('✅ Order created:', response.data)
    return response.data?.data || response.data
  } catch (error) {
    console.error('❌ Failed to create order:', error)
    throw error
  }
}
