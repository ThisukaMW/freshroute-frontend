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
