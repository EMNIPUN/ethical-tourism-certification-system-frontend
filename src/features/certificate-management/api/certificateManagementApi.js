import { apiRequest } from '../../../shared/api/apiClient'
import { getStoredToken } from '../../auth/services/authService'

function authToken() {
	const token = getStoredToken()

	if (!token) {
		throw new Error('Authentication required')
	}

	return token
}

export function getCertificates(status) {
	const query = status ? `?status=${encodeURIComponent(status)}` : ''

	return apiRequest(`/certification/certificates${query}`, {
		method: 'GET',
		token: authToken(),
	})
}

export function getEligibleHotels() {
	return apiRequest('/certification/certificates/eligible', {
		method: 'GET',
		token: authToken(),
	})
}

export function getCertificateDetails(certificateNumber) {
	return apiRequest(`/certification/certificates/${encodeURIComponent(certificateNumber)}`, {
		method: 'GET',
		token: authToken(),
	})
}

export function issueCertificate({ hotelId, validityPeriodInMonths }) {
	return apiRequest('/certification/certificates', {
		method: 'POST',
		token: authToken(),
		body: {
			hotelId,
			validityPeriodInMonths,
		},
	})
}

export function renewCertificate({ certificateId, validityPeriodInMonths = 12 }) {
	return apiRequest(`/certification/certificates/${certificateId}/renew`, {
		method: 'PUT',
		token: authToken(),
		body: {
			validityPeriodInMonths,
		},
	})
}

export function revokeCertificate({ certificateId, reason }) {
	return apiRequest(`/certification/certificates/${certificateId}/revoke`, {
		method: 'PUT',
		token: authToken(),
		body: {
			reason,
		},
	})
}

export function inactivateCertificate({ certificateId, reason }) {
	return apiRequest(`/certification/certificates/${certificateId}`, {
		method: 'DELETE',
		token: authToken(),
		body: {
			reason,
		},
	})
}

export function updateTrustScore({ certificateId, scoreChange, reason }) {
	return apiRequest(`/certification/certificates/${certificateId}/trustscore`, {
		method: 'PUT',
		token: authToken(),
		body: {
			scoreChange,
			reason,
		},
	})
}

export function updateCertificateTrustScore({ hotelId, averageRating, reviewCount }) {
	return apiRequest(`/certification/certificates/hotel/${hotelId}/update-score`, {
		method: 'PATCH',
		token: authToken(),
		body: {
			averageRating,
			reviewCount,
		},
	})
}

export function getCertificateTimeline({
	certificateId,
	page = 1,
	limit = 20,
	order = 'desc',
	eventType,
	from,
	to,
}) {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
		order,
	})

	if (from) {
		params.set('from', from)
	}

	if (to) {
		params.set('to', to)
	}

	if (Array.isArray(eventType) && eventType.length) {
		params.set('eventType', eventType.join(','))
	} else if (typeof eventType === 'string' && eventType.trim()) {
		params.set('eventType', eventType.trim())
	}

	return apiRequest(`/certification/certificates/${certificateId}/timeline?${params.toString()}`, {
		method: 'GET',
		token: authToken(),
	})
}
