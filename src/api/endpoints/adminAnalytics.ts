import apiClient from '../../store/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RevenueTrendPoint {
  label: string
  revenue: number
  orders: number
}

export interface SellerRevenuePoint {
  seller: string
  revenue: number
  orders: number
}

export interface CategoryPoint {
  name: string
  value: number   // percentage 0-100
  color: string
}

export interface PaymentMethodPoint {
  name: string
  value: number   // percentage 0-100
  color: string
}

export interface TransactionTrendPoint {
  label: string
  successful: number
  failed: number
}

export interface AovTrendPoint {
  label: string
  aov: number
  refundRate: number
}

export interface RevenueToday {
  revenueToday: number
  paidOrdersToday: number
}

export interface AdminAnalyticsData {
  revenueToday:      RevenueToday
  revenueTrend:      RevenueTrendPoint[]
  revenueBySeller:   SellerRevenuePoint[]
  categoryBreakdown: CategoryPoint[]
  paymentBreakdown:  PaymentMethodPoint[]
  transactionTrend:  TransactionTrendPoint[]
  aovTrend:          AovTrendPoint[]
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * GET /dashboard/admin/analytics?period=...
 * Fetches all analytics data for the admin analytics page in one request.
 */
export const getAdminAnalytics = async (period: Period): Promise<AdminAnalyticsData> => {
  const response = await apiClient.get('/analytics/admin', {
    params: { period },
  })
  return response.data
}