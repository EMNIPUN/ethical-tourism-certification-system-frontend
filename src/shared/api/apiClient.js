const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1'

export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL

async function parseJsonResponse(response) {
	const text = await response.text()

	if (!text) {
		return null
	}

	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

export async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
	const requestHeaders = {
		'Content-Type': 'application/json',
		...headers,
	}

	if (token) {
		requestHeaders.Authorization = `Bearer ${token}`
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		headers: requestHeaders,
		body: body ? JSON.stringify(body) : undefined,
	})

	const data = await parseJsonResponse(response)

	if (!response.ok) {
		const message = data?.error || data?.message || 'Request failed'
		const error = new Error(message)
		error.status = response.status
		error.data = data
		throw error
	}

	return data
}
