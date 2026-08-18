import apiClient from "../client";

export type RefundStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface RefundListItem {
  id: string;
  amount: number;
  reason: string | null;
  status: RefundStatus;
  createdAt: string;
  fieldAdmin: { user: { name: string; email: string } };
  order: {
    orderNumber: string;
    totalAmount: number;
    status: string;
    buyer?: { user: { name: string; email: string } };
    payment?: {
      gatewayPaymentId: string | null;
      amount: number;
      status: string;
      currency: string;
    } | null;
  };
  refundItems: Array<{
    rejectedQuantity: number;
    lineAmount: number;
    orderItem: { product: { name: string; unit: string } };
    inspection: {
      result: string;
      rejectedQuantity: number | null;
      notes: string | null;
    } | null;
  }>;
}

export interface ListRefundsParams {
  status?: string;
  since?: string;
  until?: string;
}

export const listRefunds = async (params?: ListRefundsParams): Promise<RefundListItem[]> => {
  const response = await apiClient.get<RefundListItem[]>("/admin/refunds", { params });
  return response.data;
};

export const getRefundById = async (refundId: string): Promise<RefundListItem> => {
  const response = await apiClient.get<RefundListItem>(`/admin/refunds/${refundId}`);
  return response.data;
};

export const updateRefundStatus = async (
  refundId: string,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
): Promise<RefundListItem> => {
  const response = await apiClient.patch<RefundListItem>(`/admin/refunds/${refundId}`, { status });
  return response.data;
};

/** Build Stripe Dashboard URL for admin to process payment/refund manually. */
export const getStripeDashboardUrl = (gatewayPaymentId: string | null | undefined): string | null => {
  if (!gatewayPaymentId?.trim()) return null;
  const isTest = gatewayPaymentId.includes("_test_");
  const base = isTest ? "https://dashboard.stripe.com/test" : "https://dashboard.stripe.com";
  if (gatewayPaymentId.startsWith("cs_")) {
    return `${base}/checkout/sessions/${gatewayPaymentId}`;
  }
  if (gatewayPaymentId.startsWith("pi_")) {
    return `${base}/payments/${gatewayPaymentId}`;
  }
  return `${base}/search?query=${encodeURIComponent(gatewayPaymentId)}`;
};

export const initiateStripeRefund = async (refundId: string): Promise<{ checkoutUrl?: string; paymentId?: string; refundStatus?: string; createdFrom?: string }> => {
  const response = await apiClient.post<{ checkoutUrl?: string; paymentId?: string; refundStatus?: string; createdFrom?: string }>(
    `/admin/refunds/${refundId}/initiate`
  );

  return response.data;
};

export default {
  listRefunds,
  getRefundById,
  updateRefundStatus,
  initiateStripeRefund,
  getStripeDashboardUrl,
};
