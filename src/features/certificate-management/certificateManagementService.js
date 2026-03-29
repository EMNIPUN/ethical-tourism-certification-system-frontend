import { apiRequest } from '../../services/apiClient'
import { getStoredToken } from '../common/auth/authService'

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
