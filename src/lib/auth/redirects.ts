export function sanitizeNextPath(
  candidate: string | null | undefined,
  fallback = '/'
): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback
  }

  return candidate
}

export function buildNextPath(pathname: string, search = ''): string {
  if (!search) {
    return pathname
  }

  return `${pathname}${search.startsWith('?') ? search : `?${search}`}`
}
