// import { useNavigate } from "react-router-dom";

// export default function PaymentSuccessPage() {
//   const navigate = useNavigate();

//   return (
//     <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
//       <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>

//         <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-background-success, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
//           <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//             <path d="M5 12l5 5L20 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </div>

//         <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#059669", margin: "0 0 8px" }}>Payment successful</p>
//         <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 12px", color: "inherit" }}>Your order is confirmed</h1>
//         <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6, margin: "0 0 2rem" }}>
//           Thank you for your purchase. Your order has been placed and will be delivered to your address.
//         </p>

//         <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 18px", marginBottom: "2rem", textAlign: "left", border: "0.5px solid #e5e7eb" }}>
//           <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>What happens next?</p>
//           <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
//             Your order will be batched and assigned to a delivery driver. You can track it from your orders page.
//           </p>
//         </div>

//         <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
//           <button
//             onClick={() => navigate("/buyer/orders")}
//             style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
//           >
//             View my orders
//           </button>
//           <button
//             onClick={() => navigate("/buyer/products")}
//             style={{ background: "transparent", color: "#6b7280", border: "0.5px solid #d1d5db", borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}
//           >
//             Browse products
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const token = localStorage.getItem("fr_token");
      if (!token) return;

      const res = await fetch("/api/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const paid = Array.isArray(data) ? data.find((o: any) => o.status === "PAID") : null;
      if (paid) setOrder(paid);
    };

    fetchLatestOrder();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(20, 83, 45);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FreshRoute", 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Receipt", 20, 30);

    // Receipt title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt", 20, 58);

    // Order info box
    doc.setFillColor(245, 247, 245);
    doc.roundedRect(15, 65, pageWidth - 30, 45, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Order Number", 25, 78);
    doc.text("Date", 25, 90);
    doc.text("Status", 25, 102);

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(order?.orderNumber || "N/A", 100, 78);
    doc.text(
      new Date(order?.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      100,
      90
    );
    doc.setTextColor(22, 163, 74);
    doc.text("PAID", 100, 102);

    // Items section
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Items", 20, 128);

    // Table header
    doc.setFillColor(20, 83, 45);
    doc.rect(15, 133, pageWidth - 30, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Product", 22, 140);
    doc.text("Qty", 120, 140);
    doc.text("Unit Price", 140, 140);
    doc.text("Total", 170, 140);

    // Table rows
    let y = 152;
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");

    const items = order?.items || [];
    items.forEach((item: any, index: number) => {
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 249);
        doc.rect(15, y - 7, pageWidth - 30, 12, "F");
      }
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const total = unitPrice * item.quantity;
      doc.text(item.product?.name || item.name || "Product", 22, y);
      doc.text(String(item.quantity), 122, y);
      doc.text(`$${unitPrice.toFixed(2)}`, 140, y);
      doc.text(`$${total.toFixed(2)}`, 170, y);
      y += 14;
    });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y + 2, pageWidth - 15, y + 2);

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text("Total Amount", 120, y + 14);
    doc.setTextColor(22, 163, 74);
    doc.text(`$${Number(order?.totalAmount || 0).toFixed(2)}`, 170, y + 14);

    // Footer
    doc.setFillColor(245, 247, 245);
    doc.rect(0, 265, pageWidth, 30, "F");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for shopping with FreshRoute!",
      pageWidth / 2,
      275,
      { align: "center" }
    );
    doc.text(
      "freshroute.com  |  support@freshroute.com",
      pageWidth / 2,
      283,
      { align: "center" }
    );

    doc.save(`FreshRoute-Receipt-${order?.orderNumber || "receipt"}.pdf`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5L20 7"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#059669",
            margin: "0 0 8px",
          }}
        >
          Payment successful
        </p>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 500,
            margin: "0 0 12px",
            color: "inherit",
          }}
        >
          Your order is confirmed
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.6,
            margin: "0 0 2rem",
          }}
        >
          Thank you for your purchase. Your order has been placed and will be
          delivered to your address.
        </p>

        {/* Order summary card */}
        {order && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: "1.5rem",
              textAlign: "left",
              border: "0.5px solid #e5e7eb",
            }}
          >
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>
              Order number
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#111827",
                fontWeight: 500,
                margin: "0 0 12px",
              }}
            >
              {order.orderNumber}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>
              Total paid
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#059669",
                fontWeight: 500,
                margin: "0 0 12px",
              }}
            >
              ${Number(order.totalAmount).toFixed(2)}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>
              Items
            </p>
            {order.items?.map((item: any) => (
              <p
                key={item.id}
                style={{ fontSize: 13, color: "#374151", margin: "2px 0" }}
              >
                {item.product?.name} × {item.quantity}
              </p>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {order && (
            <button
              onClick={generatePDF}
              style={{
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "11px 24px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Download receipt
            </button>
          )}
          <button
            onClick={() => navigate("/buyer/orders")}
            style={{
              background: "transparent",
              color: "#6b7280",
              border: "0.5px solid #d1d5db",
              borderRadius: 8,
              padding: "11px 24px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            View my orders
          </button>
          <button
            onClick={() => navigate("/buyer/products")}
            style={{
              background: "transparent",
              color: "#6b7280",
              border: "0.5px solid #d1d5db",
              borderRadius: 8,
              padding: "11px 24px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Browse products
          </button>
        </div>
      </div>
    </div>
  );
}