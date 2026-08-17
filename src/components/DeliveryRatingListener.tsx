import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useNotificationContext } from '../context/NotificationContext'
import RatingModal from './RatingModal'

interface OrderForRating {
  orderId: string
  driverId: string
  buyerId: string
  sellerName?: string
  products: { id: string; name: string; sellerId: string }[]
}

// Watches for "ORDER_DELIVERED" notifications and pops the rating modal
// automatically. Mounted once, globally, inside MainLayout for buyers.
const DeliveryRatingListener = (): JSX.Element | null => {
  const { notifications, markAsRead } = useNotificationContext()

  const [pendingNotifId, setPendingNotifId] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<OrderForRating | null>(null)
  const [loading, setLoading] = useState(false)

  // Find the oldest unread delivery notification we haven't already grabbed
  useEffect(() => {
    if (pendingNotifId || orderData) return // already handling one

    const deliveryNotif = notifications.find(
      (n) => !n.read && n.data?.type === 'ORDER_DELIVERED' && n.data?.orderId
    )
    if (deliveryNotif) {
      setPendingNotifId(deliveryNotif.id)
    }
  }, [notifications, pendingNotifId, orderData])

  // Once we've picked a notification, fetch the full order so we can build
  // the props RatingModal needs (productId + sellerId per item, driverId, buyerId)
  useEffect(() => {
    if (!pendingNotifId) return

    const notif = notifications.find((n) => n.id === pendingNotifId)
    const orderId = notif?.data?.orderId
    if (!orderId) return

    const fetchOrder = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('fr_token')
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load order')
        const order = await res.json()

        setOrderData({
          orderId: order.id,
          driverId: order.deliveryStop?.route?.driverId ?? '',
          buyerId: order.buyerId,
          products: order.items.map((item: any) => ({
            id: item.productId,
            name: item.product?.name ?? 'Product',
            sellerId: item.sellerId,
          })),
        })
      } catch (err) {
        console.error('DeliveryRatingListener: failed to load order for rating', err)
        // Bail out on this notification so we don't get stuck retrying forever
        setPendingNotifId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [pendingNotifId, notifications])

  const handleClose = () => {
    if (pendingNotifId) markAsRead(pendingNotifId)
    setPendingNotifId(null)
    setOrderData(null)
  }

  if (loading || !orderData) return null

  // Guard: if the order has no resolvable driver (shouldn't happen for a
  // delivered order, but just in case), still let them rate — driverId
  // will be empty and the backend rating create will need a valid one,
  // so we skip showing the modal rather than submit bad data
  if (!orderData.driverId) return null

  return (
    <RatingModal
      isOpen={true}
      onClose={handleClose}
      orderId={orderData.orderId}
      driverId={orderData.driverId}
      buyerId={orderData.buyerId}
      products={orderData.products}
    />
  )
}

export default DeliveryRatingListener