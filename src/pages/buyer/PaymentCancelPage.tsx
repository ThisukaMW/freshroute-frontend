import { useNavigate } from "react-router-dom";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>

        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d97706", margin: "0 0 8px" }}>Payment cancelled</p>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 12px", color: "inherit" }}>No charge was made</h1>
        <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6, margin: "0 0 2rem" }}>
          Your payment was cancelled and you have not been charged. Your cart items are still saved.
        </p>

        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 18px", marginBottom: "2rem", textAlign: "left", border: "0.5px solid #e5e7eb" }}>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>Changed your mind?</p>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
            You can return to your cart and try again whenever you're ready. Your items are still waiting.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/buyer/cart")}
            style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Return to cart
          </button>
          <button
            onClick={() => navigate("/buyer/products")}
            style={{ background: "transparent", color: "#6b7280", border: "0.5px solid #d1d5db", borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}
          >
            Browse products
          </button>
        </div>

      </div>
    </div>
  );
}