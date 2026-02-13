export function buildQueryString(params?: Record<string, unknown>): string {
	if (!params) return ''
	const search = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (value != null) search.set(key, String(value))
	}
	const str = search.toString()
	return str ? `?${str}` : ''
}
