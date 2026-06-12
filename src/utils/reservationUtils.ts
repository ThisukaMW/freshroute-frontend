/**
 * Utility functions for stock reservation management
 */

export interface ReservationStatus {
  isExpired: boolean
  timeRemaining: string
  expiresAt: Date
  percentageRemaining: number
}

/**
 * Calculate remaining time for a reservation
 * @param expiresAt ISO datetime string when reservation expires
 * @returns Object with expiry info
 */
export const getReservationStatus = (expiresAt: string): ReservationStatus => {
  const expiry = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()

  const isExpired = diffMs <= 0

  // Calculate total time (2 hours = 7200000 ms)
  const totalTimeMs = 2 * 60 * 60 * 1000
  const percentageRemaining = Math.max(0, Math.min(100, (diffMs / totalTimeMs) * 100))

  let timeRemaining = ''
  if (isExpired) {
    timeRemaining = 'Expired'
  } else {
    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    
    if (minutes > 0) {
      timeRemaining = `${minutes}m ${seconds}s remaining`
    } else {
      timeRemaining = `${seconds}s remaining`
    }
  }

  return {
    isExpired,
    timeRemaining,
    expiresAt: expiry,
    percentageRemaining,
  }
}

/**
 * Format expiry time for display
 */
export const formatExpiryTime = (expiresAt: string): string => {
  const status = getReservationStatus(expiresAt)
  return status.timeRemaining
}

/**
 * Check if reservation is running out (less than 10 minutes)
 */
export const isReservationExpiring = (expiresAt: string): boolean => {
  const status = getReservationStatus(expiresAt)
  const tenMinutesMs = 10 * 60 * 1000
  const diffMs = status.expiresAt.getTime() - new Date().getTime()
  return diffMs > 0 && diffMs < tenMinutesMs
}
