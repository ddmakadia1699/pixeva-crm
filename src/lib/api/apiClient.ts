/**
 * Pixeva CRM — Centralized API Gateway Client
 * ===========================================
 * All application data is routed through the AWS API Gateway (backed by AWS Lambda microservices)
 * querying Supabase PostgreSQL with strict tenant account-scoping (account_id).
 * Direct Supabase database queries from the frontend are prohibited.
 */

export const DEFAULT_ACCOUNT_ID = 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a';
const ACCOUNT_STORAGE_KEY = 'pixeva_active_account_id';

export function getActiveAccountId(): string {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNT_ID;
  try {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
  } catch (e) {
    // Ignore storage errors
  }
  return DEFAULT_ACCOUNT_ID;
}

export function setActiveAccountId(accountId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, accountId.trim());
  } catch (e) {
    // Ignore storage errors
  }
}

export function getApiGatewayUrl(): string {
  if (process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL) {
    return process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';
}

async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; accountId?: string }> {
  const baseUrl = getApiGatewayUrl();
  const accountId = getActiveAccountId();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-account-id': accountId,
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Network response was not ok');
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {}
      return {
        success: false,
        error: parsedErr?.error || parsedErr?.message || `HTTP ${res.status}: ${errText.slice(0, 100)}`,
        accountId,
      };
    }

    const json = await res.json();
    return {
      success: json.success !== false,
      data: json.data !== undefined ? json.data : json,
      accountId: json.accountId || accountId,
    };
  } catch (err: any) {
    // If local 5001 is unreachable, attempt Next.js local server proxy fallback (/api/...)
    if (baseUrl.includes('5001') && typeof window !== 'undefined') {
      try {
        const nextApiFallback = `/api${cleanPath}`;
        const fallbackRes = await fetch(nextApiFallback, {
          ...options,
          headers: { ...headers, 'x-account-id': accountId },
        });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          return { success: true, data: json.data !== undefined ? json.data : json, accountId };
        }
      } catch (fallbackErr) {}
    }

    console.warn(`[apiClient] Request to ${url} failed:`, err.message);
    return {
      success: false,
      error: err.message || 'Network request failed',
      accountId,
    };
  }
}

export const apiClient = {
  getAccountId: getActiveAccountId,
  setAccountId: setActiveAccountId,

  // 1. Dashboard Metrics
  dashboard: {
    getMetrics: async () => {
      const res = await apiRequest('/dashboard');
      return res.data;
    },
  },

  // 2. Enquiries & Leads Microservice
  enquiries: {
    list: async () => {
      const res = await apiRequest('/enquiries');
      return res.data || [];
    },
    create: async (lead: any) => {
      const res = await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify(lead),
      });
      return res.data;
    },
    update: async (id: string, status: string, details: Record<string, any> = {}) => {
      const res = await apiRequest('/enquiries', {
        method: 'PUT',
        body: JSON.stringify({ ...details, id, status }),
      });
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiRequest(`/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.success;
    },
    deleteBatch: async (ids: string[]) => {
      const res = await apiRequest('/enquiries', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
      return res.success;
    },
  },

  // 3. Bookings & Production Projects Microservice
  projects: {
    list: async () => {
      const res = await apiRequest('/bookings');
      return res.data || [];
    },
    create: async (project: any) => {
      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      return res.data;
    },
    update: async (id: string, updates: any) => {
      const res = await apiRequest('/bookings', {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates }),
      });
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiRequest(`/bookings?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.success;
    },
  },

  // 4. Contracts & Digital Signatures Microservice
  contracts: {
    list: async () => {
      const res = await apiRequest('/contracts');
      return res.data || [];
    },
    create: async (contract: any) => {
      const res = await apiRequest('/contracts', {
        method: 'POST',
        body: JSON.stringify(contract),
      });
      return res.data;
    },
    sign: async (id: string, signatureData?: string) => {
      const res = await apiRequest('/contracts', {
        method: 'PUT',
        body: JSON.stringify({ id, signature_data: signatureData }),
      });
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiRequest(`/contracts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.success;
    },
  },

  // 5. Galleries & QR Tent Cards Microservice
  galleries: {
    list: async () => {
      const res = await apiRequest('/galleries');
      return res.data || [];
    },
    create: async (gallery: any) => {
      const res = await apiRequest('/galleries', {
        method: 'POST',
        body: JSON.stringify({ resource: 'galleries', ...gallery }),
      });
      return res.data;
    },
  },

  // 6. Client Requests Microservice (Post-Production)
  clientRequests: {
    list: async () => {
      const res = await apiRequest('/client-requests');
      return res.data || [];
    },
    create: async (req: any) => {
      const res = await apiRequest('/client-requests', {
        method: 'POST',
        body: JSON.stringify({ resource: 'client-requests', ...req }),
      });
      return res.data;
    },
    update: async (id: string, updates: any) => {
      const res = await apiRequest('/client-requests', {
        method: 'PUT',
        body: JSON.stringify({ resource: 'client-requests', id, ...updates }),
      });
      return res.data;
    },
  },

  // 7. Finances & Invoices
  finances: {
    getSummary: async () => {
      const res = await apiRequest('/finances');
      return res.data;
    },
  },
};
