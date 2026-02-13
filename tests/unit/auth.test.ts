import { describe, expect, it } from 'vitest'
import { generateAuthHeader } from '../../src/lib/auth.js'

// ═══════════════════════════════════════════════════════════════
//  generateAuthHeader — V2 Authorization
// ═══════════════════════════════════════════════════════════════

describe('generateAuthHeader', () => {
	const EXPECTED_HEADER =
		'IYZWSv2 YXBpS2V5OmFwaV9rZXkmcmFuZG9tS2V5OnJhbmRvbV9zdHJpbmcmc2lnbmF0dXJlOjAxNzUwODkyMWEyOWVlNTYwMWJjZDFmYmU4M2VmZDJlMmJlNDNhZjAyZWNlZmYzMGNmMmU5MWE1MzlhYWIzNTU='

	it('should match the iyzipay-node V2 test vector', async () => {
		const header = await generateAuthHeader('api_key', 'secret_key', 'random_string', 'uri', '"body"')
		expect(header).toBe(EXPECTED_HEADER)
	})

	it('should start with IYZWSv2 prefix', async () => {
		const header = await generateAuthHeader('ak', 'sk', 'rnd', '/path', '{}')
		expect(header).toMatch(/^IYZWSv2 /)
	})

	it('should produce valid base64 after the prefix', async () => {
		const header = await generateAuthHeader('ak', 'sk', 'rnd', '/path', '{}')
		const base64Part = header.slice('IYZWSv2 '.length)
		const decoded = atob(base64Part)
		expect(decoded).toContain('apiKey:ak')
		expect(decoded).toContain('randomKey:rnd')
		expect(decoded).toContain('signature:')
	})

	it('should include all three components in the decoded payload', async () => {
		const header = await generateAuthHeader('my-api-key', 'my-secret', 'my-rnd', '/v2/payment', '{"amount":100}')
		const decoded = atob(header.slice('IYZWSv2 '.length))
		const parts = decoded.split('&')

		expect(parts).toHaveLength(3)
		expect(parts[0]).toBe('apiKey:my-api-key')
		expect(parts[1]).toBe('randomKey:my-rnd')
		expect(parts[2]).toMatch(/^signature:[0-9a-f]{64}$/)
	})

	it('should produce different signatures for different bodies', async () => {
		const a = await generateAuthHeader('ak', 'sk', 'rnd', '/path', '{"a":1}')
		const b = await generateAuthHeader('ak', 'sk', 'rnd', '/path', '{"b":2}')
		expect(a).not.toBe(b)
	})

	it('should produce different signatures for different paths', async () => {
		const a = await generateAuthHeader('ak', 'sk', 'rnd', '/payment/auth', '{}')
		const b = await generateAuthHeader('ak', 'sk', 'rnd', '/payment/refund', '{}')
		expect(a).not.toBe(b)
	})

	it('should handle undefined body (GET requests)', async () => {
		const header = await generateAuthHeader('ak', 'sk', 'rnd', '/path', undefined)
		const decoded = atob(header.slice('IYZWSv2 '.length))
		expect(decoded).toContain('signature:')

		// Should differ from a request with an actual body
		const withBody = await generateAuthHeader('ak', 'sk', 'rnd', '/path', '{"data":1}')
		expect(header).not.toBe(withBody)
	})
})
