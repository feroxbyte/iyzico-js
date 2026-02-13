import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockBinCheckResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		binNumber: '454671',
		cardType: 'CREDIT_CARD',
		cardAssociation: 'VISA',
		cardFamily: 'Maximum',
		bankName: 'İş Bankası',
		bankCode: 64,
		commercial: 0,
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  BIN Check
// ═══════════════════════════════════════════════════════════════

describe('bin.check', () => {
	it('should POST to /payment/bin/check with binNumber', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockBinCheckResponse())

		await client.bin.check({
			binNumber: '454671',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/bin/check')

		const body = lastBody()
		expect(body.binNumber).toBe('454671')
	})

	it('should forward locale and conversationId', async () => {
		const { client, lastBody } = createMockClient(mockBinCheckResponse())

		await client.bin.check({
			binNumber: '454671',
			locale: 'en',
			conversationId: 'conv-123',
		})

		const body = lastBody()
		expect(body.locale).toBe('en')
		expect(body.conversationId).toBe('conv-123')
	})

	it('should return card metadata on success', async () => {
		const { client } = createMockClient(mockBinCheckResponse())
		const res = await client.bin.check({ binNumber: '454671' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.binNumber).toBe('454671')
			expect(res.cardType).toBe('CREDIT_CARD')
			expect(res.cardAssociation).toBe('VISA')
			expect(res.cardFamily).toBe('Maximum')
			expect(res.bankName).toBe('İş Bankası')
			expect(res.bankCode).toBe(64)
			expect(res.commercial).toBe(0)
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(mockErrorResponse({ errorCode: '5004', errorMessage: 'Invalid BIN number' }))
		const res = await client.bin.check({ binNumber: '000000' })

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5004')
		}
	})
})
