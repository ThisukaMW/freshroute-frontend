import apiClient from '../client'

export interface CartItem {
  id: string
  productId: string
  name: string
  category?: string
  price: string | number
  unit: string
  quantity: number
  imageUrl?: string
  vendor?: string
  requirements?: string
  sellerId?: string
  reservation?: {
    id: string
    status: 'ACTIVE' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'
    expiresAt: string
  }
}

export interface CartResponse {
  id: string
  buyerId: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
}

/**
 * Get the user's shopping cart
 */
export const getCart = async (): Promise<CartResponse> => {
  try {
    console.log('🔄 Fetching cart from backend...')
    const response = await apiClient.get('/api/v1/cart')
    console.log('✅ Cart fetched:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch cart:', error)
    throw error
  }
}

/**
 * Add item to cart
 */
export const addItemToCart = async (
  productId: string,
  quantity: number,
  sellerId?: string
): Promise<CartItem> => {
  try {
    console.log(`🔄 Adding ${quantity}x product ${productId} to cart...`)
    const response = await apiClient.post('/api/v1/cart/add', {
      productId,
      quantity,
      sellerId,
    })
    console.log('✅ Item added to cart:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to add item to cart:', error)
    throw error
  }
}

/**
 * Remove item from cart with seller identification
 */
export const removeItemFromCart = async (productId: string, sellerId: string): Promise<void> => {
  try {
    console.log(`🔄 Removing product ${productId} from seller ${sellerId} from cart...`)
    await apiClient.delete(`/api/v1/cart/${productId}`, {
      params: { sellerId }
    })
    console.log('✅ Item removed from cart')
  } catch (error) {
    console.error('❌ Failed to remove item from cart:', error)
    throw error
  }
}

/**
 * Update item quantity in cart with seller identification
 */
export const updateCartItemQuantity = async (
  productId: string,
  sellerId: string,
  quantity: number
): Promise<CartItem> => {
  try {
    console.log(`🔄 Updating quantity for product ${productId} from seller ${sellerId} to ${quantity}...`)
    const response = await apiClient.patch('/api/v1/cart', {
      productId,
      sellerId,
      quantity,
    })
    console.log('✅ Item quantity updated:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to update item quantity:', error)
    throw error
  }
}

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<void> => {
  try {
    console.log('🔄 Clearing cart...')
    await apiClient.post('/api/v1/cart/clear')
    console.log('✅ Cart cleared')
  } catch (error) {
    console.error('❌ Failed to clear cart:', error)
    throw error
  }
}

/**
 * Apply promo code to cart
 */
export const applyPromoCode = async (code: string): Promise<CartResponse> => {
  try {
    console.log(`🔄 Applying promo code ${code}...`)
    const response = await apiClient.post('/api/v1/cart/apply-promo', {
      code,
    })
    console.log('✅ Promo code applied:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to apply promo code:', error)
    throw error
  }
}

/**
 * Save item for later
 */
export const saveItemForLater = async (productId: string): Promise<CartItem> => {
  try {
    console.log(`🔄 Saving product ${productId} for later...`)
    const response = await apiClient.post('/api/v1/cart/save-for-later', {
      productId,
    })
    console.log('✅ Item saved for later:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to save item for later:', error)
    throw error
  }
}
