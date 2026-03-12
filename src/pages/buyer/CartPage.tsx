// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// };

// export default function CartPage() {
//   const navigate = useNavigate();
  
//   const [cartItems, setCartItems] = useState<CartItem[]>([
//     {
//       id: "1",
//       name: "Fresh Apples",
//       price: 5.5,
//       quantity: 2,
//     },
//     {
//       id: "2",
//       name: "Organic Bananas",
//       price: 3.0,
//       quantity: 1,
//     },
//   ]);

//   const getTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   const removeItem = (id: string) => {
//     setCartItems(cartItems.filter((item) => item.id !== id));
//   };

//   const handleCheckout = () => {
//     // Example orderId (normally returned from backend)
//     const orderId = "demo-order-123";

//     navigate("/checkout", {
//       state: { orderId: orderId },
//     });
//   };

//   return (
//     <div className="container py-5">
//       <h2>Your Cart</h2>

//       {cartItems.length === 0 ? (
//         <p>Your cart is empty</p>
//       ) : (
//         <>
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginTop: "20px",
//             }}
//           >
//             <thead>
//               <tr style={{ borderBottom: "1px solid #ddd" }}>
//                 <th style={{ textAlign: "left", padding: "10px" }}>Product</th>
//                 <th style={{ padding: "10px" }}>Price</th>
//                 <th style={{ padding: "10px" }}>Quantity</th>
//                 <th style={{ padding: "10px" }}>Total</th>
//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {cartItems.map((item) => (
//                 <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
//                   <td style={{ padding: "10px" }}>{item.name}</td>
//                   <td style={{ padding: "10px" }}>${item.price}</td>
//                   <td style={{ padding: "10px" }}>{item.quantity}</td>
//                   <td style={{ padding: "10px" }}>
//                     ${(item.price * item.quantity).toFixed(2)}
//                   </td>
//                   <td>
//                     <button
//                       onClick={() => removeItem(item.id)}
//                       style={{
//                         background: "#ff4d4f",
//                         color: "#fff",
//                         border: "none",
//                         padding: "6px 10px",
//                         borderRadius: "4px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       Remove
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div
//             style={{
//               marginTop: "20px",
//               textAlign: "right",
//             }}
//           >
//             <h3>Total: ${getTotal().toFixed(2)}</h3>

//             <button
//               onClick={handleCheckout}
//               style={{
//                 marginTop: "10px",
//                 padding: "12px 20px",
//                 background: "#635bff",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "6px",
//                 fontSize: "16px",
//                 cursor: "pointer",
//               }}
//             >
//               Proceed to Checkout
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }