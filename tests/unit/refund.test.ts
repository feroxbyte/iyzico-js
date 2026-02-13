import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockRefundResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		paymentId: '12345678',
		paymentTransactionId: 'PT-001',
		price: 0.3,
		currency: 'TRY',
		authCode: '115446',
		hostReference: 'mock-host-ref',
		refundHostReference: 'mock-refund-host-ref',
		...overrides,
	})
}

function mockRefundAmountBasedResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		paymentId: '12345678',
		price: 1.0,
		currency: 'TRY',
		authCode: '115446',
		hostReference: 'mock-host-ref',
		refundHostReference: 'mock-refund-host-ref',
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  Refund (V1 — per item)
// ═══════════════════════════════════════════════════════════════

describe('refund.create', () => {
	it('should POST to /payment/refund with paymentTransactionId and price', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockRefundResponse())

		await client.refund.create({
			paymentTransactionId: 'PT-001',
			price: '0.3',
			ip: '85.34.78.112',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/refund')

		const body = lastBody()
		expect(body.paymentTransactionId).toBe('PT-001')
		expect(body.price).toBe('0.3')
		expect(body.ip).toBe('85.34.78.112')
	})

	it('should return refund details on success', async () => {
		const { client } = createMockClient(mockRefundResponse())
		const res = await client.refund.create({
			paymentTransactionId: 'PT-001',
			price: '0.3',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBe('12345678')
			expect(res.paymentTransactionId).toBe('PT-001')
			expect(res.price).toBe(0.3)
		}
	})

	it('should forward currency when provided', async () => {
		const { client, lastBody } = createMockClient(mockRefundResponse())

		await client.refund.create({
			paymentTransactionId: 'PT-001',
			price: '0.3',
			currency: 'TRY',
		})

		expect(lastBody().currency).toBe('TRY')
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5118', errorMessage: 'Refund amount is more than refundable amount' }),
		)
		const res = await client.refund.create({
			paymentTransactionId: 'PT-001',
			price: '999.99',
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5118')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Refund Amount-Based (V2 — by paymentId)
// ═══════════════════════════════════════════════════════════════

describe('refund.createAmountBased', () => {
	it('should POST to /v2/payment/refund with paymentId and price', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockRefundAmountBasedResponse())

		await client.refund.createAmountBased({
			paymentId: '12345678',
			price: '1.0',
			ip: '85.34.78.112',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/payment/refund')

		const body = lastBody()
		expect(body.paymentId).toBe('12345678')
		expect(body.price).toBe('1.0')
	})

	it('should return refund details on success', async () => {
		const { client } = createMockClient(mockRefundAmountBasedResponse())
		const res = await client.refund.createAmountBased({
			paymentId: '12345678',
			price: '1.0',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBe('12345678')
			expect(res.price).toBe(1.0)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Refund Charged From Merchant
// ═══════════════════════════════════════════════════════════════

describe('refund.createChargedFromMerchant', () => {
	it('should POST to /payment/iyzipos/refund/merchant/charge', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockRefundResponse())

		await client.refund.createChargedFromMerchant({
			paymentTransactionId: 'PT-001',
			price: '0.3',
			ip: '85.34.78.112',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/refund/merchant/charge')
		expect(lastBody().paymentTransactionId).toBe('PT-001')
	})
})
