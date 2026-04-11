import { apiRequest } from '../../../shared/api/apiClient'

function withToken(token) {
	return token ? { token } : {}
}

export function fetchAllHotelContacts(token) {
	return apiRequest('/hotels-search/contacts', {
		method: 'GET',
		...withToken(token),
	})
}

export function searchHotelContactsByLocation(location, token) {
	return apiRequest(`/hotels-search/contacts/search?location=${encodeURIComponent(location.trim())}`, {
		method: 'GET',
		...withToken(token),
	})
}

export function fetchHotelContactById(hotelId, token) {
	return apiRequest(`/hotels-search/contacts/${encodeURIComponent(hotelId)}`, {
		method: 'GET',
		...withToken(token),
	})
}

export function fetchHotelFeedbackById(hotelId, token) {
	return apiRequest(`/hotels-search/contacts/${encodeURIComponent(hotelId)}/feedback`, {
		method: 'GET',
		...withToken(token),
	})
}

export function fetchAIHotelRecommendations(token) {
	return apiRequest('/hotels-search/ai-recommendations', {
		method: 'GET',
		...withToken(token),
	})
}

export function createHotelFeedback(hotelId, payload, token) {
	return apiRequest(`/hotels-search/contacts/${encodeURIComponent(hotelId)}/feedback`, {
		method: 'POST',
		body: payload,
		...withToken(token),
	})
}

export function updateHotelFeedback(hotelId, feedbackId, payload, token) {
	return apiRequest(`/hotels-search/contacts/${encodeURIComponent(hotelId)}/feedback/${encodeURIComponent(feedbackId)}`, {
		method: 'PUT',
		body: payload,
		...withToken(token),
	})
}

export function deleteHotelFeedback(hotelId, feedbackId, token) {
	return apiRequest(`/hotels-search/contacts/${encodeURIComponent(hotelId)}/feedback/${encodeURIComponent(feedbackId)}`, {
		method: 'DELETE',
		...withToken(token),
	})
}
