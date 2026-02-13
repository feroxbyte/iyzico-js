import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockPaymentDetailsResponse() {
	return mockSuccessResponse({
		payments: [
			{
				paymentId: '12345678',
				paymentStatus: 1,
				paymentRefundStatus: 'NOT_REFUNDED',
				price: 1.0,
				paidPrice: 1.1,
				installment: 1,
				merchantCommissionRate: 10.0,
				merchantCommissionRateAmount: 0.1,
				iyziCommissionRateAmount: 0.03,
				iyziCommissionFee: 0.25,
				paymentConversationId: 'conv-123',
				fraudStatus: 1,
				cardType: 'CREDIT_CARD',
				cardAssociation: 'MASTER_CARD',
				cardFamily: 'Bonus',
				binNumber: '55287900',
				lastFourDigits: '0008',
				basketId: 'B-123',
				currency: 'TRY',
				connectorName: 'connector',
				authCode: '123456',
				threeDS: false,
				phase: 'AUTH',
				acquirerBankName: 'Bank',
				hostReference: 'host-ref',
				createdDate: '2025-07-24 10:00:00',
				cancels: [],
				itemTransactions: [
					{
						paymentTransactionId: 'tx-001',
						transactionStatus: 1,
						price: 0.5,
						paidPrice: 0.55,
						merchantCommissionRate: 10.0,
						merchantCommissionRateAmount: 0.05,
						iyziCommissionRateAmount: 0.015,
						iyziCommissionFee: 0.125,
						blockageRate: 10.0,
						blockageRateAmountMerchant: 0.05,
						blockageRateAmountSubMerchant: 0,
						blockageResolvedDate: '2025-08-07 10:00:00',
						merchantPayoutAmount: 0.35,
						convertedPayout: {
							paidPrice: 0.55,
							iyziCommissionRateAmount: 0.015,
							iyziCommissionFee: 0.125,
							blockageRateAmountMerchant: 0.05,
							blockageRateAmountSubMerchant: 0,
							merchantPayoutAmount: 0.35,
							iyziConversionRate: 1.0,
							iyziConversionRateAmount: 0.55,
							currency: 'TRY',
						},
						refunds: [],
					},
				],
			},
		],
	})
}

function mockDailyTransactionsResponse() {
	return mockSuccessResponse({
		currentPage: 1,
		totalPageCount: 3,
		transactions: [
			{
				transactionType: 'PAYMENT',
				transactionDate: '2025-07-24 10:00:00',
				transactionId: 'tx-001',
				transactionStatus: 1,
				afterSettlement: 0,
				paymentTxId: 'ptx-001',
				paymentId: '12345678',
				conversationId: 'conv-123',
				paymentPhase: 'AUTH',
				price: 1.0,
				paidPrice: 1.1,
				transactionCurrency: 'TRY',
				installment: 1,
				threeDS: 0,
				settlementCurrency: 'TRY',
				connectorType: 'connector',
				authCode: '123456',
				hostReference: 'host-ref',
				basketId: 'B-123',
				iyzicoCommission: 0.03,
				iyzicoFee: 0.25,
				merchantPayoutAmount: 0.72,
			},
		],
	})
}

// ═══════════════════════════════════════════════════════════════
//  reporting.getPaymentDetails
// ═══════════════════════════════════════════════════════════════

describe('reporting.getPaymentDetails', () => {
	it('should GET to correct URL with paymentId', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockPaymentDetailsResponse())

		await client.reporting.getPaymentDetails({ paymentId: '12345678' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/reporting/payment/details?paymentId=12345678')
		expect(lastMethod()).toBe('GET')
	})

	it('should GET with paymentConversationId', async () => {
		const { client, lastUrl } = createMockClient(mockPaymentDetailsResponse())

		await client.reporting.getPaymentDetails({ paymentConversationId: 'conv-123' })

		expect(lastUrl()).toBe(
			'https://sandbox-api.iyzipay.com/v2/reporting/payment/details?paymentConversationId=conv-123',
		)
	})

	it('should forward locale and conversationId as query params', async () => {
		const { client, lastUrl } = createMockClient(mockPaymentDetailsResponse())

		await client.reporting.getPaymentDetails({
			paymentId: '12345678',
			locale: 'tr',
			conversationId: 'req-1',
		})

		expect(lastUrl()).toContain('locale=tr')
		expect(lastUrl()).toContain('conversationId=req-1')
	})

	it('should not send a request body', async () => {
		const { client, lastHasBody } = createMockClient(mockPaymentDetailsResponse())

		await client.reporting.getPaymentDetails({ paymentId: '12345678' })

		expect(lastHasBody()).toBe(false)
	})

	it('should parse success response with nested objects', async () => {
		const { client } = createMockClient(mockPaymentDetailsResponse())

		const res = await client.reporting.getPaymentDetails({ paymentId: '12345678' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.payments).toHaveLength(1)
			const payment = res.payments[0]!
			expect(payment.paymentId).toBe('12345678')
			expect(payment.cardType).toBe('CREDIT_CARD')
			expect(payment.itemTransactions).toHaveLength(1)
			expect(payment.itemTransactions![0]!.paymentTransactionId).toBe('tx-001')
			expect(payment.itemTransactions![0]!.convertedPayout?.currency).toBe('TRY')
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5152', errorMessage: 'Payment not found', errorGroup: 'NOT_FOUND' }),
		)

		const res = await client.reporting.getPaymentDetails({ paymentId: 'nonexistent' })

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5152')
			expect(res.errorMessage).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  reporting.getDailyTransactions
// ═══════════════════════════════════════════════════════════════

describe('reporting.getDailyTransactions', () => {
	it('should GET to correct URL with page and transactionDate', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockDailyTransactionsResponse())

		await client.reporting.getDailyTransactions({ page: 1, transactionDate: '2025-07-24' })

		expect(lastUrl()).toBe(
			'https://sandbox-api.iyzipay.com/v2/reporting/payment/transactions?page=1&transactionDate=2025-07-24',
		)
		expect(lastMethod()).toBe('GET')
	})

	it('should forward locale and conversationId', async () => {
		const { client, lastUrl } = createMockClient(mockDailyTransactionsResponse())

		await client.reporting.getDailyTransactions({
			page: 1,
			transactionDate: '2025-07-24',
			locale: 'en',
			conversationId: 'req-2',
		})

		expect(lastUrl()).toContain('locale=en')
		expect(lastUrl()).toContain('conversationId=req-2')
	})

	it('should not send a request body', async () => {
		const { client, lastHasBody } = createMockClient(mockDailyTransactionsResponse())

		await client.reporting.getDailyTransactions({ page: 1, transactionDate: '2025-07-24' })

		expect(lastHasBody()).toBe(false)
	})

	it('should parse paginated response', async () => {
		const { client } = createMockClient(mockDailyTransactionsResponse())

		const res = await client.reporting.getDailyTransactions({ page: 1, transactionDate: '2025-07-24' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.currentPage).toBe(1)
			expect(res.totalPageCount).toBe(3)
			expect(res.transactions).toHaveLength(1)
			const tx = res.transactions[0]!
			expect(tx.transactionType).toBe('PAYMENT')
			expect(tx.paymentId).toBe('12345678')
			if (tx.transactionType === 'PAYMENT') {
				expect(tx.merchantPayoutAmount).toBe(0.72)
			}
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '10051', errorMessage: 'Invalid date', errorGroup: 'NOT_FOUND' }),
		)

		const res = await client.reporting.getDailyTransactions({ page: 1, transactionDate: 'bad-date' })

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('10051')
			expect(res.errorMessage).toBe('Invalid date')
		}
	})
})
