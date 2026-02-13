import { describe, expect, it } from 'vitest'
import { generateWebhookTestSignature, verifyWebhookSignature } from '../../src/lib/webhook.js'
import type { WebhookDirectPayload, WebhookHppPayload, WebhookSubscriptionPayload } from '../../src/types/webhook.js'

const SECRET_KEY = 'sandbox-qaIiLIxhjMgx3LSKIVvp6j17NunHOFtD'

const directPayload: WebhookDirectPayload = {
	paymentId: 'pay123',
	paymentConversationId: 'conv456',
	status: 'SUCCESS',
	iyziEventType: 'CREDIT_PAYMENT_AUTH',
	merchantId: 'M1',
}

const hppPayload: WebhookHppPayload = {
	iyziPaymentId: 'pay789',
	token: 'tok_abc',
	paymentConversationId: 'conv012',
	status: 'SUCCESS',
	iyziEventType: 'CREDIT_PAYMENT_AUTH',
	merchantId: 'M1',
}

const subscriptionPayload: WebhookSubscriptionPayload = {
	subscriptionReferenceCode: 'sub123',
	orderReferenceCode: 'ord456',
	customerReferenceCode: 'cust789',
	iyziEventType: 'subscription.order.success',
}

const MERCHANT_ID = 'merchant123'

// ═══════════════════════════════════════════════════════════════
//  Direct webhook (Non-3DS / 3DS)
// ═══════════════════════════════════════════════════════════════

describe('direct webhook', () => {
	it('should verify a valid signature', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, directPayload)
		const valid = await verifyWebhookSignature(SECRET_KEY, directPayload, sig)
		expect(valid).toBe(true)
	})

	it('should reject a tampered signature', async () => {
		const valid = await verifyWebhookSignature(
			SECRET_KEY,
			directPayload,
			'0000000000000000000000000000000000000000000000000000000000000000',
		)
		expect(valid).toBe(false)
	})
})

// ═══════════════════════════════════════════════════════════════
//  HPP webhook (Checkout Form / Pay with iyzico)
// ═══════════════════════════════════════════════════════════════

describe('HPP webhook', () => {
	it('should verify a valid signature', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, hppPayload)
		const valid = await verifyWebhookSignature(SECRET_KEY, hppPayload, sig)
		expect(valid).toBe(true)
	})

	it('should reject a tampered signature', async () => {
		const valid = await verifyWebhookSignature(
			SECRET_KEY,
			hppPayload,
			'0000000000000000000000000000000000000000000000000000000000000000',
		)
		expect(valid).toBe(false)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription webhook
// ═══════════════════════════════════════════════════════════════

describe('subscription webhook', () => {
	it('should verify a valid signature with merchantId', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload, MERCHANT_ID)
		const valid = await verifyWebhookSignature(SECRET_KEY, subscriptionPayload, sig, MERCHANT_ID)
		expect(valid).toBe(true)
	})

	it('should return false when merchantId is missing', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload, MERCHANT_ID)
		const valid = await verifyWebhookSignature(SECRET_KEY, subscriptionPayload, sig)
		expect(valid).toBe(false)
	})

	it('should return false when merchantId is wrong', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload, MERCHANT_ID)
		const valid = await verifyWebhookSignature(SECRET_KEY, subscriptionPayload, sig, 'wrongMerchant')
		expect(valid).toBe(false)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Auto-detection
// ═══════════════════════════════════════════════════════════════

describe('auto-detection', () => {
	it('should detect direct format (no token, no subscriptionReferenceCode)', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, directPayload)
		expect(await verifyWebhookSignature(SECRET_KEY, directPayload, sig)).toBe(true)
		// Should NOT verify as HPP
		expect(await verifyWebhookSignature(SECRET_KEY, hppPayload, sig)).toBe(false)
	})

	it('should detect HPP format (has token)', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, hppPayload)
		expect(await verifyWebhookSignature(SECRET_KEY, hppPayload, sig)).toBe(true)
		// Should NOT verify as direct
		expect(await verifyWebhookSignature(SECRET_KEY, directPayload, sig)).toBe(false)
	})

	it('should detect subscription format (has subscriptionReferenceCode)', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload, MERCHANT_ID)
		expect(await verifyWebhookSignature(SECRET_KEY, subscriptionPayload, sig, MERCHANT_ID)).toBe(true)
	})
})

// ═══════════════════════════════════════════════════════════════
//  Edge cases
// ═══════════════════════════════════════════════════════════════

describe('edge cases', () => {
	it('should return false for empty signature', async () => {
		const valid = await verifyWebhookSignature(SECRET_KEY, directPayload, '')
		expect(valid).toBe(false)
	})

	it('should return empty string from generateWebhookTestSignature for subscription without merchantId', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload)
		expect(sig).toBe('')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Round-trip: generate → verify
// ═══════════════════════════════════════════════════════════════

describe('round-trip', () => {
	it('should round-trip direct payload', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, directPayload)
		expect(await verifyWebhookSignature(SECRET_KEY, directPayload, sig)).toBe(true)
	})

	it('should round-trip HPP payload', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, hppPayload)
		expect(await verifyWebhookSignature(SECRET_KEY, hppPayload, sig)).toBe(true)
	})

	it('should round-trip subscription payload', async () => {
		const sig = await generateWebhookTestSignature(SECRET_KEY, subscriptionPayload, MERCHANT_ID)
		expect(await verifyWebhookSignature(SECRET_KEY, subscriptionPayload, sig, MERCHANT_ID)).toBe(true)
	})
})
