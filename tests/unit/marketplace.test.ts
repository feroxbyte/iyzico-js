import { describe, expect, it } from 'vitest'
import { randomId } from '../helpers.js'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockSubMerchantCreateResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		subMerchantKey: 'mock-sub-merchant-key-001',
		...overrides,
	})
}

function mockSubMerchantRetrieveResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		name: 'John Store',
		email: 'sub@merchant.com',
		gsmNumber: '+905350000000',
		address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		iban: 'TR180006200119000006672315',
		bankCountry: 'TR',
		currency: 'TRY',
		taxOffice: '',
		legalCompanyTitle: '',
		subMerchantExternalId: 'ext-001',
		identityNumber: '74300864791',
		subMerchantType: 'PERSONAL',
		subMerchantKey: 'mock-sub-merchant-key-001',
		...overrides,
	})
}

function mockApprovalResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		paymentTransactionId: 'PT-001',
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  Sub-Merchant
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.create', () => {
	it('should POST to /onboarding/submerchant with correct body', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockSubMerchantCreateResponse())

		await client.marketplace.subMerchant.create({
			subMerchantType: 'PERSONAL',
			email: 'sub@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
			subMerchantExternalId: `ext-${randomId()}`,
			iban: 'TR180006200119000006672315',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/onboarding/submerchant')

		const body = lastBody()
		expect(body.subMerchantType).toBe('PERSONAL')
		expect(body.email).toBe('sub@merchant.com')
		expect(body.contactName).toBe('John')
		expect(body.identityNumber).toBe('74300864791')
	})

	it('should return subMerchantKey on success', async () => {
		const { client } = createMockClient(mockSubMerchantCreateResponse())
		const res = await client.marketplace.subMerchant.create({
			subMerchantType: 'PERSONAL',
			email: 'sub@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
			subMerchantExternalId: `ext-${randomId()}`,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.subMerchantKey).toBe('mock-sub-merchant-key-001')
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({
				errorCode: '2000',
				errorMessage: 'This service is only available for marketplace customers',
			}),
		)
		const res = await client.marketplace.subMerchant.create({
			subMerchantType: 'PERSONAL',
			email: 'sub@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
			subMerchantExternalId: `ext-${randomId()}`,
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('2000')
		}
	})
})

describe('marketplace.subMerchant.update', () => {
	it('should PUT to /onboarding/submerchant', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockSuccessResponse())

		await client.marketplace.subMerchant.update({
			subMerchantKey: 'mock-sub-merchant-key-001',
			email: 'updated@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Updated Address No:2',
			iban: 'TR180006200119000006672315',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/onboarding/submerchant')
		expect(lastMethod()).toBe('PUT')
	})

	it('should send subMerchantKey in request body', async () => {
		const { client, lastBody } = createMockClient(mockSuccessResponse())

		await client.marketplace.subMerchant.update({
			subMerchantKey: 'mock-sub-merchant-key-001',
			email: 'updated@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Updated Address No:2',
			iban: 'TR180006200119000006672315',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
		})

		expect(lastBody().subMerchantKey).toBe('mock-sub-merchant-key-001')
	})
})

describe('marketplace.subMerchant.retrieve', () => {
	it('should POST to /onboarding/submerchant/detail with subMerchantExternalId', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockSubMerchantRetrieveResponse())

		await client.marketplace.subMerchant.retrieve({ subMerchantExternalId: 'ext-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/onboarding/submerchant/detail')
		expect(lastBody().subMerchantExternalId).toBe('ext-001')
	})

	it('should return sub-merchant details on success', async () => {
		const { client } = createMockClient(mockSubMerchantRetrieveResponse())
		const res = await client.marketplace.subMerchant.retrieve({ subMerchantExternalId: 'ext-001' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.subMerchantKey).toBe('mock-sub-merchant-key-001')
			expect(res.email).toBe('sub@merchant.com')
			expect(res.subMerchantType).toBe('PERSONAL')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Item Payout Update
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.updatePayoutItem', () => {
	it('should PUT to /payment/item with correct body', async () => {
		const { client, lastUrl, lastMethod, lastBody } = createMockClient(
			mockSuccessResponse({
				paymentTransactionId: 'PT-001',
				subMerchantKey: 'sub-key-001',
				subMerchantPrice: 0.27,
			}),
		)

		await client.marketplace.subMerchant.updatePayoutItem({
			paymentTransactionId: 'PT-001',
			subMerchantKey: 'sub-key-001',
			subMerchantPrice: 0.27,
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/item')
		expect(lastMethod()).toBe('PUT')

		const body = lastBody()
		expect(body.paymentTransactionId).toBe('PT-001')
		expect(body.subMerchantKey).toBe('sub-key-001')
		expect(body.subMerchantPrice).toBe(0.27)
	})

	it('should return payout details on success', async () => {
		const { client } = createMockClient(
			mockSuccessResponse({
				paymentTransactionId: 'PT-001',
				subMerchantKey: 'sub-key-001',
				subMerchantPrice: 0.27,
				subMerchantPayoutAmount: 0.27,
				merchantPayoutAmount: 0.03,
			}),
		)

		const res = await client.marketplace.subMerchant.updatePayoutItem({
			paymentTransactionId: 'PT-001',
			subMerchantKey: 'sub-key-001',
			subMerchantPrice: 0.27,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentTransactionId).toBe('PT-001')
			expect(res.subMerchantKey).toBe('sub-key-001')
			expect(res.subMerchantPayoutAmount).toBe(0.27)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Approval
// ═══════════════════════════════════════════════════════════════

describe('marketplace.approval.approve', () => {
	it('should POST to /payment/iyzipos/item/approve', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockApprovalResponse())

		await client.marketplace.approval.approve({ paymentTransactionId: 'PT-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/item/approve')
		expect(lastBody().paymentTransactionId).toBe('PT-001')
	})

	it('should return paymentTransactionId on success', async () => {
		const { client } = createMockClient(mockApprovalResponse())
		const res = await client.marketplace.approval.approve({ paymentTransactionId: 'PT-001' })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.paymentTransactionId).toBe('PT-001')
		}
	})
})

describe('marketplace.approval.disapprove', () => {
	it('should POST to /payment/iyzipos/item/disapprove', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockApprovalResponse())

		await client.marketplace.approval.disapprove({ paymentTransactionId: 'PT-001' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/iyzipos/item/disapprove')
		expect(lastBody().paymentTransactionId).toBe('PT-001')
	})
})
