import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockInstallmentResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		installmentDetails: [
			{
				binNumber: '552879',
				cardType: 'CREDIT_CARD',
				cardAssociation: 'MASTER_CARD',
				cardFamilyName: 'Paraf',
				bankName: 'Halk Bankası',
				bankCode: 12,
				force3ds: 0,
				forceCvc: 0,
				commercial: 0,
				dccEnabled: 0,
				agricultureEnabled: 0,
				installmentPrices: [
					{ installmentPrice: 100.0, totalPrice: 100.0, installmentNumber: 1 },
					{ installmentPrice: 53.0, totalPrice: 106.0, installmentNumber: 2 },
					{ installmentPrice: 36.0, totalPrice: 108.0, installmentNumber: 3 },
				],
			},
		],
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  Installment Query
// ═══════════════════════════════════════════════════════════════

describe('installment.query', () => {
	it('should POST to /payment/iyzipos/installment with price and binNumber', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockInstallmentResponse())

		await client.installment.query({
			price: '100.0',
			binNumber: '552879',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/installment')

		const body = lastBody()
		expect(body.price).toBe('100.0')
		expect(body.binNumber).toBe('552879')
	})

	it('should allow binNumber to be optional', async () => {
		const { client, lastBody } = createMockClient(mockInstallmentResponse())

		await client.installment.query({
			price: '100.0',
		})

		const body = lastBody()
		expect(body.price).toBe('100.0')
		expect(body.binNumber).toBeUndefined()
	})

	it('should return installment details on success', async () => {
		const { client } = createMockClient(mockInstallmentResponse())
		const res = await client.installment.query({ price: '100.0', binNumber: '552879' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.installmentDetails).toHaveLength(1)

			const detail = res.installmentDetails[0]!
			expect(detail.binNumber).toBe('552879')
			expect(detail.cardType).toBe('CREDIT_CARD')
			expect(detail.cardAssociation).toBe('MASTER_CARD')
			expect(detail.cardFamilyName).toBe('Paraf')
			expect(detail.bankName).toBe('Halk Bankası')
			expect(detail.bankCode).toBe(12)
			expect(detail.force3ds).toBe(0)

			expect(detail.installmentPrices).toHaveLength(3)
			expect(detail.installmentPrices[0]).toEqual({
				installmentPrice: 100.0,
				totalPrice: 100.0,
				installmentNumber: 1,
			})
			expect(detail.installmentPrices[2]!.installmentNumber).toBe(3)
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5004', errorMessage: 'Price must be greater than zero' }),
		)
		const res = await client.installment.query({ price: '0' })

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5004')
		}
	})
})
