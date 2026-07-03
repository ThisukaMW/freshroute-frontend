import apiClient from "../client";

export type BatchStatus =
  | "OPEN"
  | "CLOSED"
  | "ROUTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface BatchListItem {
  id: string;
  batchNumber: string;
  status: BatchStatus;
  dropClusterKey: string | null;
  scheduledDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  orderCount: number;
  pickupHub: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  routes: Array<{
    id: string;
    routeNumber: string;
    status: string;
    fieldAdmin: { id: string; user: { id: string; name: string; email: string } } | null;
    driver: { user: { name: string } } | null;
    truck: { id: string; vehicleNumber: string | null } | null;
  }>;
  _count: { orders: number };
}

export interface BatchListResponse {
  batches: BatchListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface BatchOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; unit: string };
  seller: { user: { id: string; name: string } };
  inspections: Array<{
    id: string;
    result: string;
    approvedQuantity: number | null;
    rejectedQuantity: number | null;
    createdAt: string;
  }>;
}

export interface BatchOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  placedAt: string;
  deliveryAddress: string;
  buyer: { user: { id: string; name: string; email: string } };
  deliveryStop: {
    id: string;
    type: string;
    status: string;
    sequenceOrder: number;
  } | null;
  items: BatchOrderItem[];
  refunds: Array<{ id: string; amount: number; status: string; createdAt: string }>;
  payment: { id: string; status: string; amount: number } | null;
}

export interface BatchStop {
  id: string;
  type: string;
  sequenceOrder: number;
  status: string;
  address: string;
  seller: { user: { name: string } } | null;
  buyer: { user: { name: string } } | null;
  order: { id: string; orderNumber: string; status: string } | null;
  itemsSummary: unknown;
}

export interface BatchDetail extends BatchListItem {
  routes: Array<{
    id: string;
    routeNumber: string;
    status: string;
    fieldAdmin: { id: string; user: { id: string; name: string; email: string } } | null;
    driver: { user: { id: string; name: string; email: string } } | null;
    truck: { id: string; vehicleNumber: string | null; maxWeight: number; maxVolume: number } | null;
    stops: BatchStop[];
  }>;
  orders: BatchOrder[];
}

export interface ListBatchesParams {
  status?: string;
  scheduledDate?: string;
  fieldAdminId?: string;
  dropClusterKey?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export const listBatches = async (params?: ListBatchesParams): Promise<BatchListResponse> => {
  const response = await apiClient.get<BatchListResponse>("/admin/batches", { params });
  return response.data;
};

export const getBatchById = async (batchId: string): Promise<BatchDetail> => {
  const response = await apiClient.get<BatchDetail>(`/admin/batches/${batchId}`);
  return response.data;
};

export interface FleetOptions {
  trucks: Array<{
    id: string;
    vehicleNumber: string | null;
    operator: string;
    isAvailable: boolean;
    maxWeight: number;
    maxVolume: number;
    maxStops: number | null;
  }>;
  fieldAdmins: Array<{ id: string; name: string; email: string }>;
}

export const listFleetOptions = async (): Promise<FleetOptions> => {
  const response = await apiClient.get<FleetOptions>("/admin/fleet-options");
  return response.data;
};

export const assignRouteFleet = async (
  routeId: string,
  payload: { truckId: string; fieldAdminId: string },
) => {
  const response = await apiClient.patch(`/admin/routes/${routeId}/fleet`, payload);
  return response.data;
};

export const getBatchRoutingHandoff = async (batchId: string): Promise<Record<string, unknown>> => {
  const response = await apiClient.get(`/admin/batches/${batchId}/routing-handoff`);
  return response.data;
};

export default {
  listBatches,
  getBatchById,
  listFleetOptions,
  assignRouteFleet,
  getBatchRoutingHandoff,
};
