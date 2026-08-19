import apiClient from "../client";

export type StaffRole = "DRIVER" | "FIELD_ADMIN";

export interface CreateStaffAccountInput {
  role: StaffRole;
  name: string;
  email: string;
  password: string;
  phone?: string;
  // Driver-only, required when role === "DRIVER". Vehicle details aren't
  // collected here — trucks are matched to batches separately via the fleet
  // assignment flow.
  licenseNumber?: string;
}

export interface CreateStaffAccountResult {
  message: string;
  user: { id: string; name: string; email: string; role: string };
}

/** Admin-only: create a driver or field admin account directly (they don't self-register). */
export const createStaffAccount = async (
  input: CreateStaffAccountInput
): Promise<CreateStaffAccountResult> => {
  const response = await apiClient.post("/admin/staff", input);
  return response.data;
};
