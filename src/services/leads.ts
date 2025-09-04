import api from "@/lib/api";

export interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
}

export interface Lead extends LeadPayload {
  _id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  requiringAttention: number;
  qualifiedLeads: number;
  conversionRate: number;
  byStatus: Record<string, number>;
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data } = await api.get("/leads");
  return data.data;
}

export async function createLead(payload: LeadPayload): Promise<Lead> {
  const { data } = await api.post("/leads/create-lead", payload);
  return data.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get("/leads/dashboard");
  return data.data;
}


