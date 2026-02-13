import { describe, expect, it } from 'vitest'
import {
	buildCheckoutFormRequest,
	buildPaymentRequest,
	buildPayWithIyzicoRequest,
	buildThreeDSRequest,
	randomId,
} from '../helpers.js'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockPaymentResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		price: 1.0,
		paidPrice: 1.1,
		installment: 1,
		paymentId: '12345678',
		fraudStatus: 1,
		merchantCommissionRate: 10,
		merchantCommissionRateAmount: 0.1,
		iyziCommissionRateAmount: 0.03,
		iyziCommissionFee: 0.25,
		cardType: 'CREDIT_CARD',
		cardAssociation: 'MASTER_CARD',
		cardFamily: 'Bonus',
		binNumber: '55287900',
		lastFourDigits: '0008',
		basketId: 'B67832',
		currency: 'TRY',
		authCode: '115446',
		phase: 'AUTH',
		hostReference: 'mock-host-ref',
		signature: 'mock-signature',
		itemTransactions: [
			{
				paymentTransactionId: 'PT-001',
				itemId: 'BI101',
				price: 0.3,
				paidPrice: 0.33,
				transactionStatus: 2,
				blockageRate: 10,
				blockageRateAmountMerchant: 0.033,
				blockageRateAmountSubMerchant: 0,
				blockageResolvedDate: '2025-10-19 14:36:52',
				iyziCommissionFee: 0.075,
				iyziCommissionRateAmount: 0.009,
				merchantCommissionRate: 10,
				merchantCommissionRateAmount: 0.03,
				merchantPayoutAmount: 0.183,
				subMerchantPrice: 0,
				subMerchantPayoutRate: 0,
				subMerchantPayoutAmount: 0,
				convertedPayout: {
					paidPrice: 0.33,
					iyziCommissionFee: 0.075,
					iyziCommissionRateAmount: 0.009,
					blockageRateAmountMerchant: 0.033,
					blockageRateAmountSubMerchant: 0,
					subMerchantPayoutAmount: 0,
					merchantPayoutAmount: 0.183,
					iyziConversionRate: 1,
					iyziConversionRateAmount: 0.183,
					currency: 'TRY',
				},
			},
		],
		...overrides,
	})
}

function mockThreeDSInitResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		threeDSHtmlContent: btoa('<html><body>3DS Mock</body></html>'),
		paymentId: '3ds-payment-001',
		signature: 'mock-3ds-signature',
		...overrides,
	})
}

function mockCheckoutFormInitResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		token: 'mock-cf-token-001',
		checkoutFormContent: '<script src="https://sandbox-static.iyzipay.com/..."></script>',
		paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/mock',
		signature: 'mock-cf-signature',
		...overrides,
	})
}

function mockPayWithIyzicoInitResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		token: 'mock-pwi-token-001',
		tokenExpireTime: 1800,
		payWithIyzicoPageUrl: 'https://sandbox-cpp.iyzipay.com/mock-pwi',
		signature: 'mock-pwi-signature',
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  NON-3DS Payment
// ═══════════════════════════════════════════════════════════════

describe('payment.create', () => {
	it('should POST to /payment/auth with correct body', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPaymentResponse())

		await client.payment.create(buildPaymentRequest())

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/auth')

		const body = lastBody()
		expect(body.price).toBe('1.0')
		expect(body.paidPrice).toBe('1.1')
		expect(body.currency).toBe('TRY')
		expect(body.paymentCard.cardNumber).toBe('5528790000000008')
		expect(body.buyer.id).toBe('BY789')
		expect(body.basketItems).toHaveLength(3)
	})

	it('should return success response with payment details', async () => {
		const { client } = createMockClient(mockPaymentResponse())
		const res = await client.payment.create(buildPaymentRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentId).toBe('12345678')
			expect(res.fraudStatus).toBe(1)
			expect(res.cardType).toBe('CREDIT_CARD')
			expect(res.cardAssociation).toBe('MASTER_CARD')
			expect(res.itemTransactions).toHaveLength(1)
			expect(res.itemTransactions[0]!.paymentTransactionId).toBe('PT-001')
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '10051', errorMessage: 'Yetersiz bakiye', errorGroup: 'NOT_SUFFICIENT_FUNDS' }),
		)
		const res = await client.payment.create(buildPaymentRequest())

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('10051')
			expect(res.errorMessage).toBe('Yetersiz bakiye')
			expect(res.errorGroup).toBe('NOT_SUFFICIENT_FUNDS')
		}
	})

	it('should pass installment count in request', async () => {
		const { client, lastBody } = createMockClient(mockPaymentResponse())
		await client.payment.create(buildPaymentRequest({ installment: 6 }))
		expect(lastBody().installment).toBe(6)
	})

	it('should forward conversationId for request correlation', async () => {
		const convId = `test-${randomId()}`
		const { client, lastBody } = createMockClient(mockPaymentResponse({ conversationId: convId }))
		const res = await client.payment.create(buildPaymentRequest({ conversationId: convId }))

		expect(lastBody().conversationId).toBe(convId)
		if (res.status === 'success') {
			expect(res.conversationId).toBe(convId)
		}
	})
})

describe('payment.retrieve', () => {
	it('should POST to /payment/detail with paymentId', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPaymentResponse({ paymentStatus: 'SUCCESS' }))
		await client.payment.retrieve({ paymentId: '12345678' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/detail')
		expect(lastBody().paymentId).toBe('12345678')
	})

	it('should support paymentConversationId as alternative identifier', async () => {
		const { client, lastBody } = createMockClient(mockPaymentResponse({ paymentStatus: 'SUCCESS' }))
		await client.payment.retrieve({ paymentId: '12345678', paymentConversationId: 'conv-001' })
		expect(lastBody().paymentConversationId).toBe('conv-001')
	})
})

describe('payment.createPreAuth', () => {
	it('should POST to /payment/preauth', async () => {
		const { client, lastUrl } = createMockClient(mockPaymentResponse({ phase: 'PRE_AUTH' }))
		await client.payment.createPreAuth(buildPaymentRequest())
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/preauth')
	})
})

describe('payment.createPostAuth', () => {
	it('should POST to /payment/postauth with paymentId and paidPrice', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPaymentResponse({ phase: 'POST_AUTH' }))

		await client.payment.createPostAuth({
			paymentId: '12345678',
			paidPrice: '1.1',
			currency: 'TRY',
			ip: '85.34.78.112',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/postauth')
		expect(lastBody().paymentId).toBe('12345678')
		expect(lastBody().paidPrice).toBe('1.1')
	})
})

// ═══════════════════════════════════════════════════════════════
//  3DS
// ═══════════════════════════════════════════════════════════════

describe('payment.threeds.initialize', () => {
	it('should POST to /payment/3dsecure/initialize with callbackUrl', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockThreeDSInitResponse())
		await client.payment.threeds.initialize(buildThreeDSRequest())

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/3dsecure/initialize')
		expect(lastBody().callbackUrl).toBe('https://merchant.com/callback')
	})

	it('should return threeDSHtmlContent (base64-encoded HTML)', async () => {
		const { client } = createMockClient(mockThreeDSInitResponse())
		const res = await client.payment.threeds.initialize(buildThreeDSRequest())

		if (res.status === 'success') {
			expect(res.threeDSHtmlContent).toBeTruthy()
			const decoded = atob(res.threeDSHtmlContent)
			expect(decoded).toContain('<html>')
		}
	})
})

describe('payment.threeds.initializePreAuth', () => {
	it('should POST to /payment/3dsecure/initialize/preauth', async () => {
		const { client, lastUrl } = createMockClient(mockThreeDSInitResponse())
		await client.payment.threeds.initializePreAuth(buildThreeDSRequest())
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/3dsecure/initialize/preauth')
	})
})

describe('payment.threeds.create (v1)', () => {
	it('should POST to /payment/3dsecure/auth with paymentId', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPaymentResponse({ mdStatus: 1 }))
		await client.payment.threeds.create({ paymentId: '3ds-payment-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/3dsecure/auth')
		expect(lastBody().paymentId).toBe('3ds-payment-001')
	})

	it('should forward conversationData when provided', async () => {
		const { client, lastBody } = createMockClient(mockPaymentResponse({ mdStatus: 1 }))
		await client.payment.threeds.create({ paymentId: '3ds-payment-001', conversationData: 'some-data-from-callback' })
		expect(lastBody().conversationData).toBe('some-data-from-callback')
	})
})

describe('payment.threeds.createV2', () => {
	it('should POST to /payment/v2/3dsecure/auth with verification fields', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPaymentResponse({ mdStatus: 1 }))

		await client.payment.threeds.createV2({
			paymentId: '3ds-payment-001',
			paidPrice: '1.1',
			basketId: 'B67832',
			currency: 'TRY',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/v2/3dsecure/auth')
		const body = lastBody()
		expect(body.paymentId).toBe('3ds-payment-001')
		expect(body.paidPrice).toBe('1.1')
		expect(body.basketId).toBe('B67832')
		expect(body.currency).toBe('TRY')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Checkout Form
// ═══════════════════════════════════════════════════════════════

describe('payment.checkoutForm.initialize', () => {
	it('should POST to /payment/iyzipos/checkoutform/initialize/auth/ecom', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockCheckoutFormInitResponse())
		await client.payment.checkoutForm.initialize(buildCheckoutFormRequest())

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom')
		expect(lastBody().callbackUrl).toBe('https://merchant.com/checkout/callback')
		expect(lastBody().enabledInstallments).toEqual([1, 2, 3, 6, 9])
	})

	it('should return token and checkoutFormContent', async () => {
		const { client } = createMockClient(mockCheckoutFormInitResponse())
		const res = await client.payment.checkoutForm.initialize(buildCheckoutFormRequest())

		if (res.status === 'success') {
			expect(res.token).toBe('mock-cf-token-001')
			expect(res.checkoutFormContent).toBeTruthy()
			expect(res.paymentPageUrl).toContain('https://')
		}
	})
})

describe('payment.checkoutForm.initializePreAuth', () => {
	it('should POST to /payment/iyzipos/checkoutform/initialize/preauth/ecom', async () => {
		const { client, lastUrl } = createMockClient(mockCheckoutFormInitResponse())
		await client.payment.checkoutForm.initializePreAuth(buildCheckoutFormRequest())
		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/preauth/ecom')
	})
})

describe('payment.checkoutForm.retrieve', () => {
	it('should POST to /payment/iyzipos/checkoutform/auth/ecom/detail with token', async () => {
		const { client, lastUrl, lastBody } = createMockClient(
			mockPaymentResponse({ token: 'mock-cf-token-001', paymentStatus: 'SUCCESS' }),
		)
		await client.payment.checkoutForm.retrieve({ token: 'mock-cf-token-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/ecom/detail')
		expect(lastBody().token).toBe('mock-cf-token-001')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Pay with iyzico
// ═══════════════════════════════════════════════════════════════

describe('payment.payWithIyzico.initialize', () => {
	it('should POST to /payment/pay-with-iyzico/initialize', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockPayWithIyzicoInitResponse())
		await client.payment.payWithIyzico.initialize(buildPayWithIyzicoRequest())

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/pay-with-iyzico/initialize')
		expect(lastBody().callbackUrl).toBe('https://merchant.com/pwi/callback')
	})

	it('should return token and payWithIyzicoPageUrl', async () => {
		const { client } = createMockClient(mockPayWithIyzicoInitResponse())
		const res = await client.payment.payWithIyzico.initialize(buildPayWithIyzicoRequest())

		if (res.status === 'success') {
			expect(res.token).toBe('mock-pwi-token-001')
			expect(res.tokenExpireTime).toBe(1800)
			expect(res.payWithIyzicoPageUrl).toContain('https://')
		}
	})
})

describe('payment.payWithIyzico.retrieve', () => {
	it('should POST to /payment/iyzipos/checkoutform/auth/ecom/detail with token', async () => {
		const { client, lastUrl, lastBody } = createMockClient(
			mockPaymentResponse({ token: 'mock-pwi-token-001', paymentStatus: 'SUCCESS' }),
		)
		await client.payment.payWithIyzico.retrieve({ token: 'mock-pwi-token-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/ecom/detail')
		expect(lastBody().token).toBe('mock-pwi-token-001')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Currencies & Payment Groups
// ═══════════════════════════════════════════════════════════════

describe('currencies', () => {
	for (const currency of ['TRY', 'USD', 'EUR', 'GBP'] as const) {
		it(`should accept ${currency} currency`, async () => {
			const { client, lastBody } = createMockClient(mockPaymentResponse({ currency }))
			await client.payment.create(buildPaymentRequest({ currency }))
			expect(lastBody().currency).toBe(currency)
		})
	}
})

describe('payment groups', () => {
	for (const paymentGroup of ['PRODUCT', 'LISTING', 'SUBSCRIPTION'] as const) {
		it(`should accept ${paymentGroup} payment group`, async () => {
			const { client, lastBody } = createMockClient(mockPaymentResponse())
			await client.payment.create(buildPaymentRequest({ paymentGroup }))
			expect(lastBody().paymentGroup).toBe(paymentGroup)
		})
	}
})
