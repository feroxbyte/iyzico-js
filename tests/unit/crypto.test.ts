import { describe, expect, it } from 'vitest'
import { hmacSha256Hex, timingSafeEqual } from '../../src/lib/crypto.js'

// ═══════════════════════════════════════════════════════════════
//  hmacSha256Hex
// ═══════════════════════════════════════════════════════════════

describe('hmacSha256Hex', () => {
	it('should match the known V2 test vector from iyzipay-node', async () => {
		// From iyzipay-node UtilsTest.js:
		//   secretKey = "secret_key"
		//   message   = randomString + uri + JSON.stringify(body)
		//           = "random_string" + "uri" + '"body"'
		const hex = await hmacSha256Hex('secret_key', 'random_stringuri"body"')
		expect(hex).toBe('017508921a29ee5601bcd1fbe83efd2e2be43af02eceff30cf2e91a539aab355')
	})

	it('should return lowercase hex string', async () => {
		const hex = await hmacSha256Hex('key', 'message')
		expect(hex).toMatch(/^[0-9a-f]{64}$/)
	})

	it('should produce different outputs for different messages', async () => {
		const a = await hmacSha256Hex('key', 'message-a')
		const b = await hmacSha256Hex('key', 'message-b')
		expect(a).not.toBe(b)
	})

	it('should produce different outputs for different keys', async () => {
		const a = await hmacSha256Hex('key-a', 'message')
		const b = await hmacSha256Hex('key-b', 'message')
		expect(a).not.toBe(b)
	})

	it('should handle empty message', async () => {
		const hex = await hmacSha256Hex('key', '')
		expect(hex).toMatch(/^[0-9a-f]{64}$/)
	})
})

// ═══════════════════════════════════════════════════════════════
//  timingSafeEqual
// ═══════════════════════════════════════════════════════════════

describe('timingSafeEqual', () => {
	it('should return true for equal strings', () => {
		expect(timingSafeEqual('abc', 'abc')).toBe(true)
	})

	it('should return false for different strings of same length', () => {
		expect(timingSafeEqual('abc', 'abd')).toBe(false)
	})

	it('should return false for different lengths', () => {
		expect(timingSafeEqual('abc', 'abcd')).toBe(false)
	})

	it('should return true for empty strings', () => {
		expect(timingSafeEqual('', '')).toBe(true)
	})

	it('should return false when only last character differs', () => {
		expect(timingSafeEqual('abcdef', 'abcdeg')).toBe(false)
	})

	it('should work with hex digest strings', () => {
		const sig = '017508921a29ee5601bcd1fbe83efd2e2be43af02eceff30cf2e91a539aab355'
		expect(timingSafeEqual(sig, sig)).toBe(true)
		expect(timingSafeEqual(sig, `${sig.slice(0, -1)}6`)).toBe(false)
	})
})
