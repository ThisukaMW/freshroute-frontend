/*import { useState } from 'react'
import RatingModal from './RatingModal'

// TEMPORARY DEMO COMPONENT
// Replace orderId, driverId, buyerId, and products with real values from your order system
// when the order flow is connected

const RatingDemoButton = () => {
  // Controls whether the rating modal is visible
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Button that opens the rating modal */
    /*<button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        ★ Rate your order
      </button>

      {/* ✅ Fixed: products prop is now provided — was causing the TypeScript error */
      /*<RatingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        orderId="demo-order-id"
        driverId="demo-driver-id"
        buyerId="demo-buyer-id"
        sellerName="Green Market"
        products={[
          { id: 'prod-1', name: 'Tomatoes',   sellerId: 'seller-1' },
          { id: 'prod-2', name: 'Red Onions', sellerId: 'seller-1' },
        ]}
      />
    </>
  )
}

export default RatingDemoButton*/