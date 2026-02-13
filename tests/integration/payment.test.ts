import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { verifyFormInitSignature, verifyPaymentSignature, verifyThreeDSInitSignature } from '../../src/lib/signature.js'
import {
	buildCheckoutFormRequest,
	buildPaymentCard,
	buildPaymentRequest,
	buildPayWithIyzicoRequest,
	buildThreeDSRequest,
	randomId,
	SANDBOX_OPTIONS,
} from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  NON-3DS Payment
// ═══════════════════════════════════════════════════════════════

describe('payment.create', () => {
	it('should create a NON-3DS payment successfully', async () => {
		const res = await sandbox.payment.create(buildPaymentRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBeTruthy()
			expect(res.fraudStatus).toBeOneOf([0, 1])
			expect(res.price).toBeGreaterThan(0)
			expect(res.paidPrice).toBeGreaterThanOrEqual(res.price)
			expect(res.installment).toBe(1)
			expect(res.cardType).toBeTruthy()
			expect(res.cardAssociation).toBeTruthy()
			expect(res.binNumber).toBeTruthy()
			expect(res.lastFourDigits).toBeTruthy()
			expect(res.currency).toBe('TRY')
			expect(res.itemTransactions.length).toBeGreaterThan(0)

			for (const item of res.itemTransactions) {
				expect(item.paymentTransactionId).toBeTruthy()
				expect(item.itemId).toBeTruthy()
				expect(item.price).toBeGreaterThan(0)
			}

			expect(await verifyPaymentSignature(SANDBOX_OPTIONS.secretKey, res)).toBe(true)
		}
	})

	it('should echo conversationId back in response', async () => {
		const convId = `integration-${randomId()}`
		const res = await sandbox.payment.create(buildPaymentRequest({ conversationId: convId }))
		expect(res.conversationId).toBe(convId)
	})

	it('should fail with invalid card number', async () => {
		const res = await sandbox.payment.create(
			buildPaymentRequest({ paymentCard: { ...buildPaymentCard(), cardNumber: '0000000000000000' } }),
		)
		expect(res.status).toBe('failure')
	})

	it('should support SUBSCRIPTION payment group', async () => {
		const res = await sandbox.payment.create(buildPaymentRequest({ paymentGroup: 'SUBSCRIPTION' }))
		expect(res.status).toBe('success')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Payment Retrieve
// ═══════════════════════════════════════════════════════════════

describe('payment.retrieve', () => {
	it('should retrieve a previously created payment', async () => {
		const createRes = await sandbox.payment.create(buildPaymentRequest())
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const res = await sandbox.payment.retrieve({ paymentId: createRes.paymentId })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBe(createRes.paymentId)
			expect(res.paymentStatus).toBe('SUCCESS')
			expect(res.price).toBe(createRes.price)
			expect(res.paidPrice).toBe(createRes.paidPrice)
			expect(await verifyPaymentSignature(SANDBOX_OPTIONS.secretKey, res)).toBe(true)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  PreAuth + PostAuth
// ═══════════════════════════════════════════════════════════════

describe('payment.createPreAuth + payment.createPostAuth', () => {
	it('should pre-authorize then capture a payment', async () => {
		const preAuthRes = await sandbox.payment.createPreAuth(buildPaymentRequest())
		expect(preAuthRes.status).toBe('success')
		if (preAuthRes.status !== 'success') return

		expect(await verifyPaymentSignature(SANDBOX_OPTIONS.secretKey, preAuthRes)).toBe(true)

		const postAuthRes = await sandbox.payment.createPostAuth({
			paymentId: preAuthRes.paymentId,
			paidPrice: '1.1',
			currency: 'TRY',
			ip: '85.34.78.112',
		})

		expect(postAuthRes.status).toBe('success')
		if (postAuthRes.status === 'success') {
			expect(await verifyPaymentSignature(SANDBOX_OPTIONS.secretKey, postAuthRes)).toBe(true)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  3DS Initialize
// ═══════════════════════════════════════════════════════════════

describe('payment.threeds.initialize', () => {
	it('should return threeDSHtmlContent for 3DS flow', async () => {
		const res = await sandbox.payment.threeds.initialize(buildThreeDSRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.threeDSHtmlContent).toBeTruthy()
			const decoded = atob(res.threeDSHtmlContent)
			expect(decoded).toContain('form')
			expect(await verifyThreeDSInitSignature(SANDBOX_OPTIONS.secretKey, res)).toBe(true)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Checkout Form Initialize
// ═══════════════════════════════════════════════════════════════

describe('payment.checkoutForm.initialize', () => {
	it('should return token and checkout form content', async () => {
		const res = await sandbox.payment.checkoutForm.initialize(buildCheckoutFormRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token).toBeTruthy()
			expect(res.checkoutFormContent).toBeTruthy()
			expect(res.paymentPageUrl).toBeTruthy()
			expect(await verifyFormInitSignature(SANDBOX_OPTIONS.secretKey, res)).toBe(true)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Pay with iyzico Initialize
// ═══════════════════════════════════════════════════════════════

describe('payment.payWithIyzico.initialize', () => {
	it('should return token and redirect URL', async () => {
		const res = await sandbox.payment.payWithIyzico.initialize(buildPayWithIyzicoRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token).toBeTruthy()
			expect(res.tokenExpireTime).toBeGreaterThan(0)
			expect(res.payWithIyzicoPageUrl).toBeTruthy()
			expect(await verifyFormInitSignature(SANDBOX_OPTIONS.secretKey, res)).toBe(true)
		}
	})
})
