import apiClient from "../client";

export interface AggregationRequest {
  dryRun: boolean;
  triggerMode: "manual" | "scheduled" | "payment_event";
  minPoints?: number;
  maxStopsPerBatch?: number;
  maxWeightPerBatch?: number;
  maxVolumePerBatch?: number;
  autoAssignRoutes?: boolean;
}

export interface AggregationResponse {
  runId?: string;
  dryRun?: boolean;
  totalBatchesCreated?: number;
  totalOrdersBatched?: number;
  totalCandidatesFetched?: number;
  totalEligible?: number;
  totalRejected?: number;
  rejectedOrders?: Array<{ orderId?: string; orderNumber?: string; reason?: string }>;
  batchesCreated?: Array<Record<string, unknown>>;
  runs?: Array<Record<string, unknown>>;
  batchCount?: number;
  assignedRoutes?: Array<Record<string, unknown>>;
  message?: string;
}

export const runAggregation = async (
  payload: AggregationRequest,
): Promise<AggregationResponse> => {
  const response = await apiClient.post("/aggregator/run", payload);
  return response.data;
};

export default {
  runAggregation,
};
