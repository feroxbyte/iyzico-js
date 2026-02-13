import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockCancelResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		paymentId: '12345678',
		price: 1.1,
		currency: 'TRY',
		authCode: '115446',
		hostReference: 'mock-host-ref',
		cancelHostReference: 'mock-cancel-host-ref',
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  Cancel
// ═══════════════════════════════════════════════════════════════

describe('cancel.create', () => {
	it('should POST to /payment/cancel with paymentId', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockCancelResponse())

		await client.cancel.create({
			paymentId: '12345678',
			ip: '85.34.78.112',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/cancel')

		const body = lastBody()
		expect(body.paymentId).toBe('12345678')
		expect(body.ip).toBe('85.34.78.112')
	})

	it('should return cancel details on success', async () => {
		const { client } = createMockClient(mockCancelResponse())
		const res = await client.cancel.create({
			paymentId: '12345678',
			ip: '85.34.78.112',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBe('12345678')
			expect(res.price).toBe(1.1)
			expect(res.currency).toBe('TRY')
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5057', errorMessage: 'No suitable transaction found for cancellation' }),
		)
		const res = await client.cancel.create({
			paymentId: 'invalid-id',
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5057')
		}
	})
})
