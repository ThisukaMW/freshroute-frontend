import { useState } from 'react'
import RatingModal from './RatingModal'

// TEMPORARY DEMO COMPONENT
// Replace orderId, driverId, buyerId with real values from your order system
// when your friend connects the order flow

const RatingDemoButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        ★ Rate your order
      </button>

      /<RatingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        orderId="demo-order-id"
        driverId="demo-driver-id"
        buyerId="demo-buyer-id"
        sellerName="Green Market"
      />
    </>
  )
}

export default RatingDemoButton