export function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase()

  if (!value) {
    return ''
  }

  if (value === 'hotelowner' || value === 'hotel_owner' || value === 'hotel owner') {
    return 'hotel owner'
  }

  return value
}

export function getDashboardPathByRole(role) {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'admin') {
    return '/certificate-management'
  }

  if (normalizedRole === 'tourist') {
    return '/search'
  }

  if (normalizedRole === 'auditor') {
    return '/audit'
  }

  if (normalizedRole === 'hotel owner') {
    return '/certificate-application'
  }

  return '/'
}

export function isAllowedRole(role, allowedRoles = []) {
  const normalizedRole = normalizeRole(role)
  return allowedRoles.map((item) => normalizeRole(item)).includes(normalizedRole)
}
