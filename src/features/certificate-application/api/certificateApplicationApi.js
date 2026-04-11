import { API_BASE_URL, apiRequest } from '../../../shared/api/apiClient'

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

async function apiMultipartRequest(path, { method = 'POST', formData, token } = {}) {
    const headers = {}

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: formData,
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

function buildHotelsQuery({ page, limit, sort, fields, filters } = {}) {
    const rawParts = []

    if (page)   rawParts.push(`page=${encodeURIComponent(page)}`)
    if (limit)  rawParts.push(`limit=${encodeURIComponent(limit)}`)
    if (sort)   rawParts.push(`sort=${encodeURIComponent(sort)}`)
    if (fields) rawParts.push(`fields=${encodeURIComponent(fields)}`)

    if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return

            if (key === 'nameSearch') {
                // Backend resolves query params directly into Mongoose find().
                // Use qs bracket syntax so Express parses it as { 'businessInfo.name': { $regex: ..., $options: 'i' } }
                rawParts.push(`businessInfo.name[$regex]=${encodeURIComponent(value)}`)
                rawParts.push(`businessInfo.name[$options]=i`)
            } else {
                rawParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            }
        })
    }

    return rawParts.length ? `?${rawParts.join('&')}` : ''
}

function buildHotelFormData({ hotelData, files } = {}) {
    const formData = new FormData()
    formData.append('hotelData', JSON.stringify(hotelData || {}))

    if (!files) {
        return formData
    }

    if (Array.isArray(files.legalDocuments)) {
        files.legalDocuments.forEach((file) => {
            if (file) {
                formData.append('legalDocuments', file)
            }
        })
    }

    if (files.salarySlips) {
        formData.append('salarySlips', files.salarySlips)
    }

    if (files.staffHandbook) {
        formData.append('staffHandbook', files.staffHandbook)
    }

    if (files.hrPolicy) {
        formData.append('hrPolicy', files.hrPolicy)
    }

    return formData
}

export function listHotels({ page, limit, sort, fields, filters } = {}, token) {
    const query = buildHotelsQuery({ page, limit, sort, fields, filters })
    return apiRequest(`/hotels${query}`, {
        method: 'GET',
        token,
    })
}

export function getHotelById(id, token) {
    return apiRequest(`/hotels/${encodeURIComponent(id)}`, {
        method: 'GET',
        token,
    })
}

export function deleteHotelById(id, token) {
    return apiRequest(`/hotels/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
    })
}

export function confirmHotelMatch(id, placeId, token) {
    return apiRequest(`/hotels/${encodeURIComponent(id)}/confirm-match`, {
        method: 'POST',
        token,
        body: {
            placeId: placeId ?? null,
        },
    })
}

export function createHotelApplication({ hotelData, files } = {}, token) {
    const formData = buildHotelFormData({ hotelData, files })

    return apiMultipartRequest('/hotels', {
        method: 'POST',
        token,
        formData,
    })
}

export function updateHotelApplication(id, { hotelData, files } = {}, token) {
    const formData = buildHotelFormData({ hotelData, files })

    return apiMultipartRequest(`/hotels/${encodeURIComponent(id)}`, {
        method: 'PUT',
        token,
        formData,
    })
}
