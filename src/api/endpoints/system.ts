import apiClient from "../client";

export type OrderingPortalStatus = {
  isOpen: boolean;
  timezone: string;
  enforceOrderingPortal: boolean;
  maintenanceWindow: { startHour: number; endHour: number; label: string };
  opensAt: string;
  closesAt: string;
  message: string;
};

export const getOrderingStatus = async (): Promise<OrderingPortalStatus> => {
  const response = await apiClient.get("/system/ordering-status");
  return response.data;
};

export default {
  getOrderingStatus,
};
