// LegalFlow AI Frontend API Client Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('legalflow_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('legalflow_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('legalflow_token');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'API Request Failed' }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => fetchAPI('/auth/me'),

  // Tenants
  getTenants: () => fetchAPI('/tenant'),
  getTenant: (id: string) => fetchAPI(`/tenant/${id}`),
  createTenant: (data: any) =>
    fetchAPI('/tenant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Leases
  getLeases: () => fetchAPI('/lease'),
  getLease: (id: string) => fetchAPI(`/lease/${id}`),
  createLease: (data: any) =>
    fetchAPI('/lease', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  parseLeasePDF: async (file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/lease/parse`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'PDF Parsing Failed' }));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return response.json();
  },

  // Payments
  getPayments: (leaseId?: string) =>
    fetchAPI(`/payment${leaseId ? `?lease_id=${leaseId}` : ''}`),
  createPayment: (data: any) =>
    fetchAPI('/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUtilityBills: (leaseId?: string) =>
    fetchAPI(`/utility-bills${leaseId ? `?lease_id=${leaseId}` : ''}`),
  generatePaymentLink: (paymentId: string) =>
    fetchAPI('/payment/link', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId }),
    }),

  // Cases
  getCases: (leaseId?: string) =>
    fetchAPI(`/cases${leaseId ? `?lease_id=${leaseId}` : ''}`),
  getCase: (id: string) => fetchAPI(`/cases/${id}`),

  // AI Compliance & Drafting
  analyzeCase: (caseId: string) =>
    fetchAPI(`/analyze?case_id=${caseId}`, {
      method: 'POST',
    }),

  // Documents & Approval Workflow
  getDocuments: (caseId?: string) =>
    fetchAPI(`/documents${caseId ? `?case_id=${caseId}` : ''}`),
  getDocument: (id: string) => fetchAPI(`/documents/${id}`),
  approveDocument: (id: string, approvalData: { approved: boolean; rejection_reason?: string }) =>
    fetchAPI(`/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    }),
};
