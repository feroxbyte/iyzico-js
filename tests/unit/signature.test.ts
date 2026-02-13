import { describe, expect, it } from 'vitest'
import { hmacSha256Hex } from '../../src/lib/crypto.js'
import {
	verifyCallbackSignature,
	verifyFormInitSignature,
	verifyFormRetrieveSignature,
	verifyPaymentSignature,
	verifyRefundSignature,
	verifyThreeDSAuthSignature,
	verifyThreeDSInitSignature,
} from '../../src/lib/signature.js'

const SECRET_KEY = 'sandbox-qaIiLIxhjMgx3LSKIVvp6j17NunHOFtD'

// ═══════════════════════════════════════════════════════════════
//  Known test vector (from iyzico docs)
// ═══════════════════════════════════════════════════════════════

describe('known test vector', () => {
	it('should produce the documented HMAC for a payment response', async () => {
		// Params: paymentId:currency:basketId:conversationId:paidPrice:price
		// Values: 22416032:TRY:basketId:conversationId:10.5:10.5
		const message = '22416032:TRY:basketId:conversationId:10.5:10.5'
		const hex = await hmacSha256Hex(SECRET_KEY, message)
		expect(hex).toBe('836c3a6c8db86c81043f2ca74edb13518b54a813f454f8dd762f0dd658610173')
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyPaymentSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyPaymentSignature', () => {
	it('should return true for a valid signature', async () => {
		const valid = await verifyPaymentSignature(SECRET_KEY, {
			paymentId: '22416032',
			currency: 'TRY',
			basketId: 'basketId',
			conversationId: 'conversationId',
			paidPrice: 10.5,
			price: 10.5,
			signature: '836c3a6c8db86c81043f2ca74edb13518b54a813f454f8dd762f0dd658610173',
		})
		expect(valid).toBe(true)
	})

	it('should return false for a tampered signature', async () => {
		const valid = await verifyPaymentSignature(SECRET_KEY, {
			paymentId: '22416032',
			currency: 'TRY',
			basketId: 'basketId',
			conversationId: 'conversationId',
			paidPrice: 10.5,
			price: 10.5,
			signature: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
		})
		expect(valid).toBe(false)
	})

	it('should strip trailing zeros from price fields', async () => {
		// 10.50 should be treated as 10.5 (same as above)
		const sig = await hmacSha256Hex(SECRET_KEY, '22416032:TRY:basketId:conversationId:10.5:10.5')
		const valid = await verifyPaymentSignature(SECRET_KEY, {
			paymentId: '22416032',
			currency: 'TRY',
			basketId: 'basketId',
			conversationId: 'conversationId',
			paidPrice: 10.5,
			price: 10.5,
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should handle undefined basketId and conversationId as empty strings', async () => {
		const message = '22416032:TRY:::10.5:10.5'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyPaymentSignature(SECRET_KEY, {
			paymentId: '22416032',
			currency: 'TRY',
			paidPrice: 10.5,
			price: 10.5,
			signature: sig,
		})
		expect(valid).toBe(true)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyThreeDSInitSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyThreeDSInitSignature', () => {
	it('should return true for a valid signature', async () => {
		const message = 'pay123:conv456'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyThreeDSInitSignature(SECRET_KEY, {
			paymentId: 'pay123',
			conversationId: 'conv456',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should handle undefined conversationId', async () => {
		const message = 'pay123:'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyThreeDSInitSignature(SECRET_KEY, {
			paymentId: 'pay123',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should return false for tampered data', async () => {
		const sig = await hmacSha256Hex(SECRET_KEY, 'pay123:conv456')
		const valid = await verifyThreeDSInitSignature(SECRET_KEY, {
			paymentId: 'pay999',
			conversationId: 'conv456',
			signature: sig,
		})
		expect(valid).toBe(false)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyThreeDSAuthSignature (alias for verifyPaymentSignature)
// ═══════════════════════════════════════════════════════════════

describe('verifyThreeDSAuthSignature', () => {
	it('should be the same function as verifyPaymentSignature', () => {
		expect(verifyThreeDSAuthSignature).toBe(verifyPaymentSignature)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyCallbackSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyCallbackSignature', () => {
	it('should return true for a valid callback signature', async () => {
		const message = 'data123:conv456:1:pay789:SUCCESS'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyCallbackSignature(SECRET_KEY, {
			conversationData: 'data123',
			conversationId: 'conv456',
			mdStatus: '1',
			paymentId: 'pay789',
			status: 'SUCCESS',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should handle undefined optional fields', async () => {
		const message = '::1:pay789:SUCCESS'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyCallbackSignature(SECRET_KEY, {
			mdStatus: '1',
			paymentId: 'pay789',
			status: 'SUCCESS',
			signature: sig,
		})
		expect(valid).toBe(true)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyFormInitSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyFormInitSignature', () => {
	it('should return true for a valid form init signature', async () => {
		const message = 'conv123:token456'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyFormInitSignature(SECRET_KEY, {
			conversationId: 'conv123',
			token: 'token456',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should handle undefined conversationId', async () => {
		const message = ':token456'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyFormInitSignature(SECRET_KEY, {
			token: 'token456',
			signature: sig,
		})
		expect(valid).toBe(true)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyFormRetrieveSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyFormRetrieveSignature', () => {
	it('should return true for a valid form retrieve signature', async () => {
		const message = 'SUCCESS:pay123:TRY:basket1:conv1:10.5:10:token1'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyFormRetrieveSignature(SECRET_KEY, {
			paymentStatus: 'SUCCESS',
			paymentId: 'pay123',
			currency: 'TRY',
			basketId: 'basket1',
			conversationId: 'conv1',
			paidPrice: 10.5,
			price: 10.0,
			token: 'token1',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should strip trailing zeros in price fields', async () => {
		// paidPrice=10.50 → 10.5, price=10.0 → 10
		const message = 'SUCCESS:pay123:TRY:::10.5:10:token1'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyFormRetrieveSignature(SECRET_KEY, {
			paymentStatus: 'SUCCESS',
			paymentId: 'pay123',
			currency: 'TRY',
			paidPrice: 10.5,
			price: 10.0,
			token: 'token1',
			signature: sig,
		})
		expect(valid).toBe(true)
	})
})

// ═══════════════════════════════════════════════════════════════
//  verifyRefundSignature
// ═══════════════════════════════════════════════════════════════

describe('verifyRefundSignature', () => {
	it('should return true for a valid refund signature', async () => {
		const message = 'pay123:10.5:TRY:conv1'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyRefundSignature(SECRET_KEY, {
			paymentId: 'pay123',
			price: 10.5,
			currency: 'TRY',
			conversationId: 'conv1',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should strip trailing zeros from price', async () => {
		// price=10.0 → "10" in the message
		const message = 'pay123:10:TRY:conv1'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyRefundSignature(SECRET_KEY, {
			paymentId: 'pay123',
			price: 10.0,
			currency: 'TRY',
			conversationId: 'conv1',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should handle undefined conversationId', async () => {
		const message = 'pay123:10.5:TRY:'
		const sig = await hmacSha256Hex(SECRET_KEY, message)
		const valid = await verifyRefundSignature(SECRET_KEY, {
			paymentId: 'pay123',
			price: 10.5,
			currency: 'TRY',
			signature: sig,
		})
		expect(valid).toBe(true)
	})

	it('should return false for a tampered signature', async () => {
		const valid = await verifyRefundSignature(SECRET_KEY, {
			paymentId: 'pay123',
			price: 10.5,
			currency: 'TRY',
			conversationId: 'conv1',
			signature: '0000000000000000000000000000000000000000000000000000000000000000',
		})
		expect(valid).toBe(false)
	})
})
