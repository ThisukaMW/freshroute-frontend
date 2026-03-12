// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// type CheckoutResponse = {
//   checkoutUrl: string;
//   paymentId: string;
// };

// export default function CheckoutPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Example: orderId passed from CartPage navigation
//   const orderId = location.state?.orderId;

//   const handleCheckout = async () => {
//     if (!orderId) {
//       setError("Order ID not found");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");

//       const res = await fetch("http://localhost:5000/api/v1/payments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           orderId: orderId,
//           currency: "usd",
//         }),
//       });

//       const data: CheckoutResponse = await res.json();

//       if (!res.ok) {
//         throw new Error((data as any).message || "Payment creation failed");
//       }

//       // Redirect to Stripe Checkout
//       window.location.href = data.checkoutUrl;

//     } catch (err: any) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">
//       <div
//         style={{
//           maxWidth: "500px",
//           margin: "0 auto",
//           padding: "30px",
//           border: "1px solid #ddd",
//           borderRadius: "10px",
//         }}
//       >
//         <h2 style={{ marginBottom: "20px" }}>Checkout</h2>

//         <p>
//           Review your order and proceed to secure payment.
//         </p>

//         {error && (
//           <div
//             style={{
//               background: "#ffe5e5",
//               color: "#b30000",
//               padding: "10px",
//               borderRadius: "5px",
//               marginBottom: "15px",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         <button
//           onClick={handleCheckout}
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "12px",
//             backgroundColor: "#635bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             fontSize: "16px",
//             cursor: "pointer",
//           }}
//         >
//           {loading ? "Processing..." : "Pay with Card"}
//         </button>

//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             marginTop: "10px",
//             width: "100%",
//             padding: "10px",
//             border: "1px solid #ccc",
//             borderRadius: "6px",
//             background: "#fff",
//             cursor: "pointer",
//           }}
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }