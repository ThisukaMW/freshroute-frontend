import React from "react";

const OrderDetailPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Order detail (demo)</h1>
      <p className="text-sm text-slate-300">
        Here you can walk through how a single order would look: items, delivery status, payment
        info, and contact options.
      </p>
    </div>
  );
};

export default OrderDetailPage;