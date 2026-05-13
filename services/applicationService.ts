import { RtiApplication } from "@/components/RtiFormModal";
import { supabase } from "@/lib/supabaseClient";

export const applicationService = {
  async getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  },

  async fetchApplications(page?: number, limit?: number, search?: string, statusFilter?: string) {
    let url = "/api/applications";
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (limit !== undefined) params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (statusFilter && statusFilter !== "All") params.append("status", statusFilter);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const headers = await this.getHeaders();
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to fetch applications");
    }
    return res.json();
  },

  async createApplication(data: Partial<RtiApplication>) {
    const headers = await this.getHeaders();
    const res = await fetch("/api/applications", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to create application");
    }
    return res.json();
  },

  async updateApplication(id: number, data: Partial<RtiApplication>) {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to update application");
    }
    return res.json();
  },

  async deleteApplication(id: number) {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/applications/${id}`, { 
      method: "DELETE",
      headers 
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to delete application");
    }
    return res.json();
  }
};

