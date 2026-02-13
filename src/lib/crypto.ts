const encoder = new TextEncoder()

/** Compute HMAC-SHA256 and return lowercase hex string */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
	])
	const buffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
	const bytes = new Uint8Array(buffer)
	let hex = ''
	for (const byte of bytes) {
		hex += byte.toString(16).padStart(2, '0')
	}
	return hex
}

/** Constant-time string comparison to prevent timing attacks */
export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false
	let result = 0
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i)
	}
	return result === 0
}
