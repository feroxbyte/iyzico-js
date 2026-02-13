import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { IyzipayConnectionError, IyzipayError, IyzipayParseError, IyzipayTimeoutError } from '../../src/core/errors.js'
import { SANDBOX_OPTIONS } from '../helpers.js'
import type { CapturedRequest } from '../test-utils.js'

// ─── Helpers ────────────────────────────────────────────────

function createClient(fetchImpl: typeof globalThis.fetch) {
	return new Iyzipay({ ...SANDBOX_OPTIONS, fetch: fetchImpl })
}

function createCapturingClient(
	responseBody: Record<string, unknown> = { status: 'success' },
	options?: { statusCode?: number; timeout?: number; baseUrl?: string },
) {
	const requests: CapturedRequest[] = []

	const mockFetch: typeof globalThis.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : (input as Request).url
		requests.push({ url, init })
		return new Response(JSON.stringify(responseBody), {
			status: options?.statusCode ?? 200,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const client = new Iyzipay({
		...SANDBOX_OPTIONS,
		...(options?.baseUrl && { baseUrl: options.baseUrl }),
		...(options?.timeout != null && { timeout: options.timeout }),
		fetch: mockFetch,
	})

	return {
		client,
		requests,
		lastUrl: () => requests.at(-1)!.url,
		lastInit: () => requests.at(-1)!.init as RequestInit,
		lastHeaders: () => (requests.at(-1)!.init as RequestInit).headers as Record<string, string>,
		lastMethod: () => (requests.at(-1)!.init as RequestInit).method,
		lastBody: () => JSON.parse((requests.at(-1)!.init as RequestInit).body as string),
	}
}

function headersOf(req: CapturedRequest) {
	return (req.init as RequestInit).headers as Record<string, string>
}

const V2_SUCCESS = { status: 'success' as const, data: {} }
const V2_PAGINATED = { status: 'success' as const, data: { items: [], totalCount: 0, currentPage: 1, pageCount: 0 } }

// ═══════════════════════════════════════════════════════════════
//  HTTP methods
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — HTTP methods', () => {
	it('should use POST for create operations', async () => {
		const { client, lastMethod } = createCapturingClient()
		await client.cancel.create({ locale: 'tr', conversationId: '1', paymentId: '1', ip: '1.1.1.1' })
		expect(lastMethod()).toBe('POST')
	})

	it('should use GET for list operations', async () => {
		const { client, lastMethod } = createCapturingClient(V2_PAGINATED)
		await client.subscription.product.list({ page: 1, count: 10 })
		expect(lastMethod()).toBe('GET')
	})

	it('should use GET for retrieve-by-reference operations', async () => {
		const { client, lastMethod } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.retrieve('ref-123')
		expect(lastMethod()).toBe('GET')
	})

	it('should use PUT for update operations', async () => {
		const { client, lastMethod } = createCapturingClient()
		await client.marketplace.subMerchant.update({
			locale: 'tr',
			conversationId: '1',
			subMerchantKey: 'key',
			name: 'Updated',
			email: 'test@test.com',
			gsmNumber: '+905350000000',
			address: 'addr',
			iban: 'TR180006200119000006672315',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
			currency: 'TRY',
		})
		expect(lastMethod()).toBe('PUT')
	})

	it('should use DELETE for delete operations', async () => {
		const { client, lastMethod } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.delete('ref-123')
		expect(lastMethod()).toBe('DELETE')
	})

	it('should use PATCH for status update operations', async () => {
		const { client, lastMethod } = createCapturingClient(V2_SUCCESS)
		await client.iyzilink.updateStatus('token-123', 'PASSIVE')
		expect(lastMethod()).toBe('PATCH')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Request headers
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — request headers', () => {
	it('should include Authorization header starting with IYZWSv2', async () => {
		const { client, lastHeaders } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		expect(lastHeaders().Authorization).toMatch(/^IYZWSv2 /)
	})

	it('should include x-iyzi-rnd header with numeric value', async () => {
		const { client, lastHeaders } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		expect(lastHeaders()['x-iyzi-rnd']).toMatch(/^\d+$/)
	})

	it('should include Accept: application/json', async () => {
		const { client, lastHeaders } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		expect(lastHeaders().Accept).toBe('application/json')
	})

	it('should include Content-Type when body is present', async () => {
		const { client, lastHeaders } = createCapturingClient()
		await client.cancel.create({ locale: 'tr', conversationId: '1', paymentId: '1', ip: '1.1.1.1' })
		expect(lastHeaders()['Content-Type']).toBe('application/json')
	})

	it('should NOT include Content-Type for bodyless requests', async () => {
		const { client, lastHeaders } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.retrieve('ref-123')
		expect(lastHeaders()['Content-Type']).toBeUndefined()
	})

	it('should generate unique x-iyzi-rnd per request', async () => {
		const { client, requests } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		await client.bin.check({ binNumber: '454671' })

		expect(headersOf(requests[0]!)['x-iyzi-rnd']).not.toBe(headersOf(requests[1]!)['x-iyzi-rnd'])
	})
})

// ═══════════════════════════════════════════════════════════════
//  Authorization header structure
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — authorization header', () => {
	it('should encode apiKey, randomKey, and signature in base64', async () => {
		const { client, lastHeaders } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })

		const base64Part = lastHeaders().Authorization!.replace('IYZWSv2 ', '')
		const decoded = atob(base64Part)

		expect(decoded).toContain(`apiKey:${SANDBOX_OPTIONS.apiKey}`)
		expect(decoded).toMatch(/randomKey:\d+/)
		expect(decoded).toMatch(/signature:[a-f0-9]{64}/)
	})

	it('should produce different signatures for different request bodies', async () => {
		const { client, requests } = createCapturingClient()
		await client.cancel.create({ locale: 'tr', conversationId: '1', paymentId: 'pay-1', ip: '1.1.1.1' })
		await client.cancel.create({ locale: 'tr', conversationId: '2', paymentId: 'pay-2', ip: '2.2.2.2' })

		expect(headersOf(requests[0]!).Authorization).not.toBe(headersOf(requests[1]!).Authorization)
	})

	it('should include auth header on GET requests (no body)', async () => {
		const { client, lastHeaders } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.retrieve('ref-123')

		const base64Part = lastHeaders().Authorization!.replace('IYZWSv2 ', '')
		const decoded = atob(base64Part)
		expect(decoded).toContain(`apiKey:${SANDBOX_OPTIONS.apiKey}`)
		expect(decoded).toMatch(/signature:[a-f0-9]{64}/)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Body serialization
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — body serialization', () => {
	it('should serialize request body as JSON string', async () => {
		const { client, lastInit } = createCapturingClient()
		await client.cancel.create({ locale: 'tr', conversationId: '123', paymentId: 'pay-1', ip: '1.2.3.4' })

		expect(typeof lastInit().body).toBe('string')
		const parsed = JSON.parse(lastInit().body as string)
		expect(parsed.locale).toBe('tr')
		expect(parsed.paymentId).toBe('pay-1')
	})

	it('should not include body for GET requests', async () => {
		const { client, lastInit } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.retrieve('ref-123')
		expect(lastInit().body).toBeUndefined()
	})

	it('should not include body for bodyless DELETE requests', async () => {
		const { client, lastInit } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.delete('ref-123')
		expect(lastInit().body).toBeUndefined()
	})

	it('should not include body for bodyless PATCH requests', async () => {
		const { client, lastInit } = createCapturingClient(V2_SUCCESS)
		await client.iyzilink.updateStatus('token-123', 'PASSIVE')
		expect(lastInit().body).toBeUndefined()
	})
})

// ═══════════════════════════════════════════════════════════════
//  URL construction
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — URL construction', () => {
	it('should construct full URL from baseUrl + path', async () => {
		const { client, lastUrl } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/bin/check')
	})

	it('should strip trailing slashes from baseUrl', async () => {
		const { client, lastUrl } = createCapturingClient(
			{ status: 'success' },
			{
				baseUrl: 'https://sandbox-api.iyzipay.com///',
			},
		)
		await client.bin.check({ binNumber: '454671' })
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/bin/check')
	})

	it('should use /v2 prefix for subscription endpoints', async () => {
		const { client, lastUrl } = createCapturingClient(V2_SUCCESS)
		await client.subscription.product.retrieve('ref-123')
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products/ref-123')
	})

	it('should append query string for list endpoints', async () => {
		const { client, lastUrl } = createCapturingClient(V2_PAGINATED)
		await client.subscription.product.list({ page: 1, count: 10 })
		expect(lastUrl()).toContain('/v2/subscription/products?')
		expect(lastUrl()).toContain('page=1')
		expect(lastUrl()).toContain('count=10')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Timeout
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — timeout', () => {
	it('should attach AbortSignal to requests', async () => {
		const { client, lastInit } = createCapturingClient()
		await client.bin.check({ binNumber: '454671' })
		expect(lastInit().signal).toBeInstanceOf(AbortSignal)
	})

	it('should throw IyzipayTimeoutError on request timeout', async () => {
		const client = createClient(async () => {
			throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayTimeoutError)
	})

	it('should default to 30_000ms timeout', async () => {
		const client = createClient(async () => {
			throw new DOMException('timeout', 'TimeoutError')
		})

		try {
			await client.bin.check({ binNumber: '454671' })
			expect.unreachable()
		} catch (error) {
			expect(error).toBeInstanceOf(IyzipayTimeoutError)
			expect((error as IyzipayTimeoutError).timeoutMs).toBe(30_000)
		}
	})

	it('should include timeout duration and path in error', async () => {
		const client = new Iyzipay({
			...SANDBOX_OPTIONS,
			timeout: 5000,
			fetch: async () => {
				throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
			},
		})

		try {
			await client.bin.check({ binNumber: '454671' })
			expect.unreachable()
		} catch (error) {
			expect(error).toBeInstanceOf(IyzipayTimeoutError)
			const e = error as IyzipayTimeoutError
			expect(e.timeoutMs).toBe(5000)
			expect(e.path).toBe('/payment/bin/check')
			expect(e.message).toContain('5000ms')
		}
	})

	it('should inherit from IyzipayError', async () => {
		const client = createClient(async () => {
			throw new DOMException('timeout', 'TimeoutError')
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayError)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Connection errors
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — connection errors', () => {
	it('should throw IyzipayConnectionError on network failure', async () => {
		const client = createClient(async () => {
			throw new TypeError('fetch failed')
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayConnectionError)
	})

	it('should include the original error as cause', async () => {
		const original = new TypeError('fetch failed')
		const client = createClient(async () => {
			throw original
		})

		try {
			await client.bin.check({ binNumber: '454671' })
			expect.unreachable()
		} catch (error) {
			expect(error).toBeInstanceOf(IyzipayConnectionError)
			const e = error as IyzipayConnectionError
			expect(e.cause).toBe(original)
			expect(e.path).toBe('/payment/bin/check')
			expect(e.message).toContain('fetch failed')
		}
	})

	it('should throw IyzipayConnectionError when response.text() fails', async () => {
		const client = new Iyzipay({
			...SANDBOX_OPTIONS,
			fetch: async () =>
				({
					text: async () => {
						throw new TypeError('body stream already read')
					},
				}) as unknown as Response,
		})

		try {
			await client.bin.check({ binNumber: '454671' })
			expect.unreachable()
		} catch (error) {
			expect(error).toBeInstanceOf(IyzipayConnectionError)
			expect((error as IyzipayConnectionError).message).toContain('body stream already read')
		}
	})

	it('should inherit from IyzipayError', async () => {
		const client = createClient(async () => {
			throw new TypeError('fetch failed')
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayError)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Parse errors
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — parse errors', () => {
	it('should throw IyzipayParseError when response is not JSON', async () => {
		const client = createClient(async () => {
			return new Response('<html>502 Bad Gateway</html>', {
				status: 502,
				headers: { 'Content-Type': 'text/html' },
			})
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayParseError)
	})

	it('should include HTTP status, raw body, and path in error', async () => {
		const htmlBody = '<html>503 Service Unavailable</html>'
		const client = createClient(async () => {
			return new Response(htmlBody, {
				status: 503,
				headers: { 'Content-Type': 'text/html' },
			})
		})

		try {
			await client.bin.check({ binNumber: '454671' })
			expect.unreachable()
		} catch (error) {
			expect(error).toBeInstanceOf(IyzipayParseError)
			const e = error as IyzipayParseError
			expect(e.httpStatus).toBe(503)
			expect(e.rawBody).toBe(htmlBody)
			expect(e.path).toBe('/payment/bin/check')
			expect(e.message).toContain('503')
		}
	})

	it('should throw on empty response body', async () => {
		const client = createClient(async () => {
			return new Response('', { status: 200 })
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayParseError)
	})

	it('should parse valid JSON regardless of Content-Type header', async () => {
		const client = new Iyzipay({
			...SANDBOX_OPTIONS,
			fetch: async () =>
				new Response(JSON.stringify({ status: 'success', locale: 'tr', systemTime: 1 }), {
					status: 200,
					headers: { 'Content-Type': 'text/plain' },
				}),
		})

		const res = await client.bin.check({ binNumber: '454671' })
		expect(res.status).toBe('success')
	})

	it('should inherit from IyzipayError', async () => {
		const client = createClient(async () => {
			return new Response('not json', { status: 200 })
		})

		await expect(client.bin.check({ binNumber: '454671' })).rejects.toThrow(IyzipayError)
	})
})

// ═══════════════════════════════════════════════════════════════
//  API errors are NOT thrown (returned as values)
// ═══════════════════════════════════════════════════════════════

describe('HttpClient — API errors (status: failure)', () => {
	it('should return error response, not throw', async () => {
		const client = createClient(async () => {
			return new Response(
				JSON.stringify({
					status: 'failure',
					errorCode: '5057',
					errorMessage: 'Validation error',
					errorGroup: 'VALIDATION',
					locale: 'tr',
					systemTime: Date.now(),
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			)
		})

		const res = await client.bin.check({ binNumber: '000000' })
		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5057')
		}
	})
})
