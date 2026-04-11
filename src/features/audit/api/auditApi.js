import { apiRequest } from '../../../shared/api/apiClient'

export const auditApi = {
  createAudit: (data, token) => apiRequest('/audits', { method: 'POST', body: data, token }),
  
  getAllAudits: (params, token) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== 'all')
    )
    const query = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/audits?${query}`, { token })
  },
  
  getAuditStats: (params = {}, token) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    )
    const query = new URLSearchParams(cleanParams).toString()
    return apiRequest(`/audits/stats/overview?${query}`, { token })
  },
  
  getAuditById: (id, token) => apiRequest(`/audits/${id}`, { token }),
  
  getAuditsByHotel: (hotelId, token) => apiRequest(`/audits/hotel/${hotelId}`, { token }),
  
  getAuditsByAuditor: (auditorId, token) => apiRequest(`/audits/auditor/${auditorId}`, { token }),
  
  reviewSection: (id, data, token) => apiRequest(`/audits/${id}/sections/review`, { method: 'PUT', body: data, token }),
  
  updateSectionScore: (id, data, token) => apiRequest(`/audits/${id}/sections/score`, { method: 'PUT', body: data, token }),
  
  addComplianceCheck: (id, data, token) => apiRequest(`/audits/${id}/compliance-checks`, { method: 'POST', body: data, token }),
  
  scheduleSiteVisit: (id, data, token) => apiRequest(`/audits/${id}/site-visit/schedule`, { method: 'POST', body: data, token }),
  
  updateSiteVisitFindings: (id, data, token) => apiRequest(`/audits/${id}/site-visit/findings`, { method: 'PUT', body: data, token }),
  
  addAttachment: (id, data, token) => apiRequest(`/audits/${id}/attachments`, { method: 'POST', body: data, token }),
  
  completeAudit: (id, data, token) => apiRequest(`/audits/${id}/complete`, { method: 'PUT', body: data, token }),
  
  suspendAudit: (id, data, token) => apiRequest(`/audits/${id}/suspend`, { method: 'PUT', body: data, token }),
  
  resumeAudit: (id, token) => apiRequest(`/audits/${id}/resume`, { method: 'PUT', token }),
  
  deleteAudit: (id, token) => apiRequest(`/audits/${id}`, { method: 'DELETE', token }),
  
  // RAG features
  processDocuments: (hotelId, formData, token) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000/api/v1'
    return fetch(`${API_BASE_URL}/audits/hotels/${hotelId}/process-documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json())
  },
  
  chatWithHotelData: (hotelId, data, token) => apiRequest(`/audits/hotels/${hotelId}/chat`, { method: 'POST', body: data, token }),

  getHotels: (token) => apiRequest('/hotels', { token }),
  getAuditors: (token) => apiRequest('/auth/users?role=Auditor', { token }),
}