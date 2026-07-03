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

// ✅ Matches what inventory service actually returns
export interface LowStockProduct {
  id: string
  name: string
  unit: string
  sellerStock: number
  aggregateStock: number
  lowStockThreshold: number
  status: string
}

export interface LowStockAlertsData {
  alerts: LowStockProduct[]
  count: number
}

// ============= DASHBOARD ENDPOINTS =============

export const getSellerDashboardMetrics = async (): Promise<SellerDashboardMetrics> => {
  try {
    const response = await apiClient.get('/dashboard/seller/metrics')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch dashboard metrics:', error)
    throw error
  }
}

export const getOrdersToday = async (): Promise<OrdersTodayData> => {
  try {
    const response = await apiClient.get('/dashboard/seller/orders-today')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch today orders:', error)
    throw error
  }
}

export const getRevenueToday = async (): Promise<RevenueTodayData> => {
  try {
    const response = await apiClient.get('/dashboard/seller/revenue-today')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch revenue:', error)
    throw error
  }
}

export const getActiveProducts = async (): Promise<ActiveProductsData> => {
  try {
    const response = await apiClient.get('/dashboard/seller/active-products')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch active products:', error)
    throw error
  }
}

export const getFulfillmentSLA = async (): Promise<FulfillmentSLAData> => {
  try {
    const response = await apiClient.get('/dashboard/seller/fulfillment-sla')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch SLA:', error)
    throw error
  }
}

export const getRecentCatalogUpdates = async (): Promise<RecentProduct[]> => {
  try {
    const response = await apiClient.get('/dashboard/seller/recent-products')
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch recent products:', error)
    throw error
  }
}

// ✅ Uses inventory/low-stock and maps to correct field names
export const getLowStockAlerts = async (): Promise<LowStockAlertsData> => {
  try {
    const response = await apiClient.get('/inventory/low-stock')
    return {
      alerts: response.data.data || [],
      count: response.data.count || 0,
    }
  } catch (error) {
    console.error('❌ Failed to fetch low stock alerts:', error)
    throw error
  }
}