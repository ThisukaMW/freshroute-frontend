import apiClient from '../../store/api/client'

// ============= TYPES =============

export interface DashboardMetric {
  value: string | number
  label: string
  helper: string
}

export interface RecentProduct {
  name: string
  price: string
  stock: string
  status: string
  imageUrl?: string
}

export interface SellerDashboardMetrics {
  sellerName: string;
  ordersToday: DashboardMetric
  revenueToday: DashboardMetric
  activeProducts: DashboardMetric
  fulfillmentSLA: DashboardMetric
  recentProducts: RecentProduct[]
}

export interface OrdersTodayData {
  ordersToday: number
  vsYesterday: string
}

export interface RevenueTodayData {
  revenueToday: number
  payoutInfo: string
}

export interface ActiveProductsData {
  activeProducts: number
  lowInStock: number
}

export interface FulfillmentSLAData {
  slaPercentage: number
  period: string
}

export interface LowStockProduct {
  id: string
  name: string
  category: string
  unit: string
  stock: number
  lowStock: number
  price: number
  status: string
  imageUrl?: string
}

export interface LowStockAlertsData {
  alerts: LowStockProduct[]
  count: number
}

// ============= DASHBOARD ENDPOINTS =============

/**
 * GET /dashboard/seller/metrics
 * Get all dashboard metrics for a seller
 * Returns: { ordersToday, revenueToday, activeProducts, fulfillmentSLA, recentProducts }
 */
export const getSellerDashboardMetrics = async (): Promise<SellerDashboardMetrics> => {
  try {
    console.log('🔄 Fetching seller dashboard metrics...')
    const response = await apiClient.get('/dashboard/seller/metrics')
    console.log('✅ Dashboard metrics fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch dashboard metrics:', error)
    throw error
  }
}

/**
 * GET /dashboard/seller/orders-today
 * Get today's orders count
 * Returns: { ordersToday, vsYesterday }
 */
export const getOrdersToday = async (): Promise<OrdersTodayData> => {
  try {
    console.log('🔄 Fetching today\'s orders...')
    const response = await apiClient.get('/dashboard/seller/orders-today')
    console.log('✅ Today\'s orders fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch today\'s orders:', error)
    throw error
  }
}

/**
 * GET /dashboard/seller/revenue-today
 * Get today's revenue
 * Returns: { revenueToday, payoutInfo }
 */
export const getRevenueToday = async (): Promise<RevenueTodayData> => {
  try {
    console.log('🔄 Fetching today\'s revenue...')
    const response = await apiClient.get('/dashboard/seller/revenue-today')
    console.log('✅ Today\'s revenue fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch today\'s revenue:', error)
    throw error
  }
}

/**
 * GET /dashboard/seller/active-products
 * Get count of active products
 * Returns: { activeProducts, lowInStock }
 */
export const getActiveProducts = async (): Promise<ActiveProductsData> => {
  try {
    console.log('🔄 Fetching active products count...')
    const response = await apiClient.get('/dashboard/seller/active-products')
    console.log('✅ Active products count fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch active products:', error)
    throw error
  }
}

/**
 * GET /dashboard/seller/fulfillment-sla
 * Get fulfillment SLA percentage
 * Returns: { slaPercentage, period }
 */
export const getFulfillmentSLA = async (): Promise<FulfillmentSLAData> => {
  try {
    console.log('🔄 Fetching fulfillment SLA...')
    const response = await apiClient.get('/dashboard/seller/fulfillment-sla')
    console.log('✅ Fulfillment SLA fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch fulfillment SLA:', error)
    throw error
  }
}

/**
 * GET /dashboard/seller/recent-products
 * Get recent catalog updates
 * Returns: Array of recent products with name, price, stock, status
 */
export const getRecentCatalogUpdates = async (): Promise<RecentProduct[]> => {
  try {
    console.log('🔄 Fetching recent catalog updates...')
    const response = await apiClient.get('/dashboard/seller/recent-products')
    console.log('✅ Recent catalog updates fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch recent catalog updates:', error)
    throw error
  }
}

/**
 * GET /inventory/low-stock
 * Get all low-stock products for seller dashboard
 * Returns: { alerts: Array of low stock products, count: number }
 */
/*export const getLowStockAlerts = async (): Promise<LowStockAlertsData> => {
  try {
    console.log('🔄 Fetching low stock alerts...')
    const response = await apiClient.get('/inventory/low-stock')
    console.log('✅ Low stock alerts fetched:', response.data)
    
    // Transform backend response to match frontend interface
    return {
      alerts: response.data.data || [],
      count: response.data.count || 0,
    }
  } catch (error) {
    console.error('❌ Failed to fetch low stock alerts:', error)
    throw error
  }
}*/
export const getLowStockAlerts = async (): Promise<LowStockAlertsData> => {
  try {
    console.log('🔄 Fetching low stock alerts...')
    const response = await apiClient.get('/dashboard/seller/low-stock-alerts')
    console.log('✅ Low stock alerts fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch low stock alerts:', error)
    throw error
  }
}
