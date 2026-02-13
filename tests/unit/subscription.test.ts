import { describe, expect, it } from 'vitest'
import {
	createMockClient,
	mockDataResponse,
	mockErrorResponse,
	mockPaginatedResponse,
	mockSuccessResponse,
} from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

const subscriptionProduct = {
	referenceCode: 'prod-ref-001',
	createdDate: '2025-01-15 10:00:00',
	name: 'Premium Magazine',
	description: 'Monthly premium content',
	status: 'ACTIVE',
	pricingPlans: [],
}

const pricingPlanData = {
	referenceCode: 'plan-ref-001',
	createdDate: Date.now(),
	name: 'Monthly Plan',
	productReferenceCode: 'prod-ref-001',
	price: 49.99,
	currencyCode: 'TRY',
	paymentInterval: 'MONTHLY',
	paymentIntervalCount: 1,
	planPaymentType: 'RECURRING',
	recurrenceCount: 12,
	trialPeriodDays: 0,
	status: 'ACTIVE',
}

function mockProductResponse(overrides?: Record<string, unknown>) {
	return mockDataResponse({ ...subscriptionProduct, ...overrides })
}

function mockPaginatedProductResponse() {
	return mockPaginatedResponse([subscriptionProduct])
}

function mockPricingPlanResponse(overrides?: Record<string, unknown>) {
	return mockDataResponse({ ...pricingPlanData, ...overrides })
}

function mockPaginatedPricingPlanResponse() {
	return mockPaginatedResponse([pricingPlanData])
}

function mockSubscriptionInitResponse(overrides?: Record<string, unknown>) {
	return mockDataResponse({
		referenceCode: 'sub-ref-001',
		parentReferenceCode: 'parent-ref-001',
		pricingPlanReferenceCode: 'plan-ref-001',
		customerReferenceCode: 'cust-ref-001',
		subscriptionStatus: 'ACTIVE',
		trialDays: 0,
		createdDate: Date.now(),
		startDate: Date.now(),
		...overrides,
	})
}

function mockCheckoutFormResponse() {
	return mockSuccessResponse({
		token: 'mock-token-123',
		checkoutFormContent: '<div>mock form</div>',
		tokenExpireTime: 300,
	})
}

function mockSubscriptionDetailResponse() {
	return mockPaginatedResponse([
		{
			referenceCode: 'sub-ref-001',
			parentReferenceCode: 'parent-ref-001',
			pricingPlanName: 'Monthly Plan',
			pricingPlanReferenceCode: 'plan-ref-001',
			productName: 'Premium Magazine',
			productReferenceCode: 'prod-ref-001',
			customerEmail: 'test@test.com',
			customerGsmNumber: '+905350000000',
			customerReferenceCode: 'cust-ref-001',
			subscriptionStatus: 'ACTIVE',
			createdDate: Date.now(),
			startDate: Date.now(),
			orders: [],
		},
	])
}

function mockBaseSuccessResponse() {
	return mockDataResponse({})
}

function mockUpgradeResponse() {
	return mockDataResponse({
		referenceCode: 'sub-ref-002',
		parentReferenceCode: 'parent-ref-001',
		pricingPlanReferenceCode: 'plan-ref-002',
		customerReferenceCode: 'cust-ref-001',
		subscriptionStatus: 'ACTIVE',
		createdDate: Date.now(),
		startDate: Date.now(),
	})
}

// ─── Mock customer helper ────────────────────────────────────

function buildSubscriptionCustomer() {
	return {
		name: 'John',
		surname: 'Doe',
		email: 'john@example.com',
		gsmNumber: '+905350000000',
		identityNumber: '74300864791',
		billingAddress: {
			address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
			zipCode: '34742',
			contactName: 'John Doe',
			city: 'Istanbul',
			country: 'Turkey',
		},
	}
}

// ═══════════════════════════════════════════════════════════════
//  Product
// ═══════════════════════════════════════════════════════════════

describe('subscription.product', () => {
	describe('create', () => {
		it('should POST to /v2/subscription/products', async () => {
			const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockProductResponse())

			await client.subscription.product.create({ name: 'Premium Magazine', description: 'Monthly content' })

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products')
			expect(lastMethod()).toBe('POST')
			expect(lastBody().name).toBe('Premium Magazine')
			expect(lastBody().description).toBe('Monthly content')
		})

		it('should return product data on success', async () => {
			const { client } = createMockClient(mockProductResponse())
			const res = await client.subscription.product.create({ name: 'Premium Magazine' })

			expect(res.status).toBe('success')
			if (res.status === 'success') {
				expect(res.data.referenceCode).toBe('prod-ref-001')
				expect(res.data.name).toBe('Premium Magazine')
			}
		})
	})

	describe('update', () => {
		it('should POST to /v2/subscription/products/{ref}', async () => {
			const { client, lastUrl, lastBody } = createMockClient(mockProductResponse({ name: 'Updated Magazine' }))

			await client.subscription.product.update('prod-ref-001', { name: 'Updated Magazine' })

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products/prod-ref-001')
			expect(lastBody().name).toBe('Updated Magazine')
		})
	})

	describe('retrieve', () => {
		it('should GET /v2/subscription/products/{ref}', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockProductResponse())

			await client.subscription.product.retrieve('prod-ref-001')

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products/prod-ref-001')
			expect(lastMethod()).toBe('GET')
		})
	})

	describe('list', () => {
		it('should GET /v2/subscription/products with query params', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockPaginatedProductResponse())

			await client.subscription.product.list({ page: 1, count: 10 })

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products?page=1&count=10')
			expect(lastMethod()).toBe('GET')
		})

		it('should GET /v2/subscription/products without params', async () => {
			const { client, lastUrl } = createMockClient(mockPaginatedProductResponse())

			await client.subscription.product.list()

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products')
		})
	})

	describe('delete', () => {
		it('should DELETE /v2/subscription/products/{ref}', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockBaseSuccessResponse())

			await client.subscription.product.delete('prod-ref-001')

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products/prod-ref-001')
			expect(lastMethod()).toBe('DELETE')
		})
	})
})

// ═══════════════════════════════════════════════════════════════
//  Pricing Plan
// ═══════════════════════════════════════════════════════════════

describe('subscription.pricingPlan', () => {
	describe('create', () => {
		it('should POST to /v2/subscription/products/{ref}/pricing-plans', async () => {
			const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockPricingPlanResponse())

			await client.subscription.pricingPlan.create('prod-ref-001', {
				name: 'Monthly Plan',
				price: 49.99,
				currencyCode: 'TRY',
				paymentInterval: 'MONTHLY',
				planPaymentType: 'RECURRING',
			})

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/products/prod-ref-001/pricing-plans')
			expect(lastMethod()).toBe('POST')
			expect(lastBody().name).toBe('Monthly Plan')
			expect(lastBody().price).toBe(49.99)
		})

		it('should return pricing plan data on success', async () => {
			const { client } = createMockClient(mockPricingPlanResponse())
			const res = await client.subscription.pricingPlan.create('prod-ref-001', {
				name: 'Monthly Plan',
				price: 49.99,
				currencyCode: 'TRY',
				paymentInterval: 'MONTHLY',
				planPaymentType: 'RECURRING',
			})

			expect(res.status).toBe('success')
			if (res.status === 'success') {
				expect(res.data.referenceCode).toBe('plan-ref-001')
				expect(res.data.paymentInterval).toBe('MONTHLY')
			}
		})
	})

	describe('update', () => {
		it('should POST to /v2/subscription/pricing-plans/{ref}', async () => {
			const { client, lastUrl, lastBody } = createMockClient(
				mockPricingPlanResponse({ name: 'Updated Plan', trialPeriodDays: 7 }),
			)

			await client.subscription.pricingPlan.update('plan-ref-001', {
				name: 'Updated Plan',
				trialPeriodDays: 7,
			})

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/pricing-plans/plan-ref-001')
			expect(lastBody().name).toBe('Updated Plan')
			expect(lastBody().trialPeriodDays).toBe(7)
		})
	})

	describe('retrieve', () => {
		it('should GET /v2/subscription/pricing-plans/{ref}', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockPricingPlanResponse())

			await client.subscription.pricingPlan.retrieve('plan-ref-001')

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/pricing-plans/plan-ref-001')
			expect(lastMethod()).toBe('GET')
		})
	})

	describe('list', () => {
		it('should GET with product ref and query params', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockPaginatedPricingPlanResponse())

			await client.subscription.pricingPlan.list('prod-ref-001', { page: 1, count: 5 })

			expect(lastUrl()).toBe(
				'https://sandbox-api.iyzipay.com/v2/subscription/products/prod-ref-001/pricing-plans?page=1&count=5',
			)
			expect(lastMethod()).toBe('GET')
		})
	})

	describe('delete', () => {
		it('should DELETE /v2/subscription/pricing-plans/{ref}', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockBaseSuccessResponse())

			await client.subscription.pricingPlan.delete('plan-ref-001')

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/pricing-plans/plan-ref-001')
			expect(lastMethod()).toBe('DELETE')
		})
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Initialize
// ═══════════════════════════════════════════════════════════════

describe('subscription.initialize', () => {
	it('should POST to /v2/subscription/initialize (NON-3DS)', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockSubscriptionInitResponse())

		await client.subscription.initialize({
			pricingPlanReferenceCode: 'plan-ref-001',
			subscriptionInitialStatus: 'ACTIVE',
			customer: buildSubscriptionCustomer(),
			paymentCard: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
				cvc: '123',
			},
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/initialize')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().pricingPlanReferenceCode).toBe('plan-ref-001')
		expect(lastBody().paymentCard.cardNumber).toBe('5528790000000008')
		expect(lastBody().customer.name).toBe('John')
	})

	it('should return subscription data on success', async () => {
		const { client } = createMockClient(mockSubscriptionInitResponse())
		const res = await client.subscription.initialize({
			pricingPlanReferenceCode: 'plan-ref-001',
			subscriptionInitialStatus: 'ACTIVE',
			customer: buildSubscriptionCustomer(),
			paymentCard: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
				cvc: '123',
			},
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBe('sub-ref-001')
			expect(res.data.subscriptionStatus).toBe('ACTIVE')
		}
	})
})

describe('subscription.initializeWithCustomer', () => {
	it('should POST to /v2/subscription/initialize/with-customer', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockSubscriptionInitResponse())

		await client.subscription.initializeWithCustomer({
			pricingPlanReferenceCode: 'plan-ref-001',
			subscriptionInitialStatus: 'ACTIVE',
			customerReferenceCode: 'cust-ref-001',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/initialize/with-customer')
		expect(lastBody().customerReferenceCode).toBe('cust-ref-001')
	})
})

describe('subscription.initializeWithCf', () => {
	it('should POST to /v2/subscription/checkoutform/initialize', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockCheckoutFormResponse())

		await client.subscription.initializeWithCf({
			callbackUrl: 'https://merchant.com/callback',
			pricingPlanReferenceCode: 'plan-ref-001',
			subscriptionInitialStatus: 'ACTIVE',
			customer: buildSubscriptionCustomer(),
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/checkoutform/initialize')
		expect(lastBody().callbackUrl).toBe('https://merchant.com/callback')
		expect(lastBody().customer.email).toBe('john@example.com')
	})

	it('should return checkout form data on success', async () => {
		const { client } = createMockClient(mockCheckoutFormResponse())
		const res = await client.subscription.initializeWithCf({
			callbackUrl: 'https://merchant.com/callback',
			pricingPlanReferenceCode: 'plan-ref-001',
			subscriptionInitialStatus: 'ACTIVE',
			customer: buildSubscriptionCustomer(),
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token).toBe('mock-token-123')
			expect(res.checkoutFormContent).toBe('<div>mock form</div>')
		}
	})
})

describe('subscription.retrieveCfResult', () => {
	it('should GET /v2/subscription/checkoutform/{token}', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockSubscriptionInitResponse())

		await client.subscription.retrieveCfResult('checkout-token-123')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/checkoutform/checkout-token-123')
		expect(lastMethod()).toBe('GET')
	})

	it('should return subscription data on success', async () => {
		const { client } = createMockClient(mockSubscriptionInitResponse())
		const res = await client.subscription.retrieveCfResult('checkout-token-123')

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBe('sub-ref-001')
			expect(res.data.customerReferenceCode).toBe('cust-ref-001')
			expect(res.data.subscriptionStatus).toBe('ACTIVE')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Operations
// ═══════════════════════════════════════════════════════════════

describe('subscription.retrieve', () => {
	it('should GET /v2/subscription/subscriptions/{ref}', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockSubscriptionDetailResponse())

		await client.subscription.retrieve('sub-ref-001')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/subscriptions/sub-ref-001')
		expect(lastMethod()).toBe('GET')
	})
})

describe('subscription.search', () => {
	it('should GET /v2/subscription/subscriptions with query params', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockSubscriptionDetailResponse())

		await client.subscription.search({
			subscriptionStatus: 'ACTIVE',
			page: 1,
			count: 10,
		})

		expect(lastUrl()).toContain('/v2/subscription/subscriptions?')
		expect(lastUrl()).toContain('subscriptionStatus=ACTIVE')
		expect(lastUrl()).toContain('page=1')
		expect(lastUrl()).toContain('count=10')
		expect(lastMethod()).toBe('GET')
	})

	it('should GET without params', async () => {
		const { client, lastUrl } = createMockClient(mockSubscriptionDetailResponse())

		await client.subscription.search()

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/subscriptions')
	})
})

describe('subscription.activate', () => {
	it('should POST to /v2/subscription/subscriptions/{ref}/activate with no body', async () => {
		const { client, lastUrl, lastMethod, lastHasBody } = createMockClient(mockBaseSuccessResponse())

		await client.subscription.activate('sub-ref-001')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/subscriptions/sub-ref-001/activate')
		expect(lastMethod()).toBe('POST')
		expect(lastHasBody()).toBe(false)
	})
})

describe('subscription.cancel', () => {
	it('should POST to /v2/subscription/subscriptions/{ref}/cancel with no body', async () => {
		const { client, lastUrl, lastMethod, lastHasBody } = createMockClient(mockBaseSuccessResponse())

		await client.subscription.cancel('sub-ref-001')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/subscriptions/sub-ref-001/cancel')
		expect(lastMethod()).toBe('POST')
		expect(lastHasBody()).toBe(false)
	})
})

describe('subscription.upgrade', () => {
	it('should POST to /v2/subscription/subscriptions/{ref}/upgrade', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockUpgradeResponse())

		await client.subscription.upgrade('sub-ref-001', {
			newPricingPlanReferenceCode: 'plan-ref-002',
			upgradePeriod: 'NOW',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/subscriptions/sub-ref-001/upgrade')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().newPricingPlanReferenceCode).toBe('plan-ref-002')
		expect(lastBody().upgradePeriod).toBe('NOW')
	})

	it('should return upgrade data on success', async () => {
		const { client } = createMockClient(mockUpgradeResponse())
		const res = await client.subscription.upgrade('sub-ref-001', {
			newPricingPlanReferenceCode: 'plan-ref-002',
			upgradePeriod: 'NOW',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBe('sub-ref-002')
			expect(res.data.pricingPlanReferenceCode).toBe('plan-ref-002')
		}
	})
})

describe('subscription.retryPayment', () => {
	it('should POST to /v2/subscription/operation/retry', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockBaseSuccessResponse())

		await client.subscription.retryPayment({
			referenceCode: 'order-ref-001',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/operation/retry')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().referenceCode).toBe('order-ref-001')
	})
})

describe('subscription.initializeCardUpdate', () => {
	it('should POST to /v2/subscription/card-update/checkoutform/initialize', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockCheckoutFormResponse())

		await client.subscription.initializeCardUpdate({
			callbackUrl: 'https://merchant.com/card-update',
			customerReferenceCode: 'cust-ref-001',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/card-update/checkoutform/initialize')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().callbackUrl).toBe('https://merchant.com/card-update')
		expect(lastBody().customerReferenceCode).toBe('cust-ref-001')
	})

	it('should return card update checkout form data', async () => {
		const { client } = createMockClient(mockCheckoutFormResponse())
		const res = await client.subscription.initializeCardUpdate({
			callbackUrl: 'https://merchant.com/card-update',
			customerReferenceCode: 'cust-ref-001',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token).toBe('mock-token-123')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Customer (Subscriber)
// ═══════════════════════════════════════════════════════════════

const customerData = {
	referenceCode: 'cust-ref-001',
	createdDate: '2025-01-15 10:00:00',
	status: 'ACTIVE',
	name: 'John',
	surname: 'Doe',
	identityNumber: '74300864791',
	email: 'john@example.com',
	gsmNumber: '+905350000000',
	contactEmail: 'john@example.com',
	contactGsmNumber: '+905350000000',
	billingAddress: {
		address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
		zipCode: '34742',
		contactName: 'John Doe',
		city: 'Istanbul',
		district: 'Kadikoy',
		country: 'Turkey',
	},
}

function mockCustomerResponse(overrides?: Record<string, unknown>) {
	return mockDataResponse({ ...customerData, ...overrides })
}

function mockPaginatedCustomerResponse() {
	return mockPaginatedResponse([customerData])
}

describe('subscription.customer', () => {
	describe('retrieve', () => {
		it('should GET /v2/subscription/customers/{ref}', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockCustomerResponse())

			await client.subscription.customer.retrieve('cust-ref-001')

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/customers/cust-ref-001')
			expect(lastMethod()).toBe('GET')
		})

		it('should return customer data on success', async () => {
			const { client } = createMockClient(mockCustomerResponse())
			const res = await client.subscription.customer.retrieve('cust-ref-001')

			expect(res.status).toBe('success')
			if (res.status === 'success') {
				expect(res.data.referenceCode).toBe('cust-ref-001')
				expect(res.data.name).toBe('John')
				expect(res.data.email).toBe('john@example.com')
				expect(res.data.billingAddress?.district).toBe('Kadikoy')
			}
		})
	})

	describe('update', () => {
		it('should POST to /v2/subscription/customers/{ref}', async () => {
			const { client, lastUrl, lastBody, lastMethod } = createMockClient(
				mockCustomerResponse({ name: 'Jane', surname: 'Smith' }),
			)

			await client.subscription.customer.update('cust-ref-001', {
				name: 'Jane',
				surname: 'Smith',
			})

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/customers/cust-ref-001')
			expect(lastMethod()).toBe('POST')
			expect(lastBody().name).toBe('Jane')
			expect(lastBody().surname).toBe('Smith')
		})

		it('should support partial updates', async () => {
			const { client, lastBody } = createMockClient(mockCustomerResponse({ email: 'new@example.com' }))

			await client.subscription.customer.update('cust-ref-001', {
				email: 'new@example.com',
			})

			expect(lastBody().email).toBe('new@example.com')
			expect(lastBody().name).toBeUndefined()
		})
	})

	describe('list', () => {
		it('should GET /v2/subscription/customers with query params', async () => {
			const { client, lastUrl, lastMethod } = createMockClient(mockPaginatedCustomerResponse())

			await client.subscription.customer.list({ page: 1, count: 10 })

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/customers?page=1&count=10')
			expect(lastMethod()).toBe('GET')
		})

		it('should GET /v2/subscription/customers without params', async () => {
			const { client, lastUrl } = createMockClient(mockPaginatedCustomerResponse())

			await client.subscription.customer.list()

			expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/subscription/customers')
		})

		it('should return paginated customer data', async () => {
			const { client } = createMockClient(mockPaginatedCustomerResponse())
			const res = await client.subscription.customer.list({ page: 1, count: 10 })

			expect(res.status).toBe('success')
			if (res.status === 'success') {
				expect(res.data.totalCount).toBe(1)
				expect(res.data.items[0]!.referenceCode).toBe('cust-ref-001')
			}
		})
	})
})

// ═══════════════════════════════════════════════════════════════
//  Error Handling
// ═══════════════════════════════════════════════════════════════

describe('subscription error handling', () => {
	it('should return error response for product create', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '100001', errorMessage: 'Product name is required' }),
		)
		const res = await client.subscription.product.create({ name: '' })

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('100001')
			expect(res.errorMessage).toBe('Product name is required')
		}
	})

	it('should return error response for subscription initialize', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '100010', errorMessage: 'Invalid pricing plan' }),
		)
		const res = await client.subscription.initialize({
			pricingPlanReferenceCode: 'invalid-ref',
			subscriptionInitialStatus: 'ACTIVE',
			customer: buildSubscriptionCustomer(),
			paymentCard: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
				cvc: '123',
			},
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('100010')
		}
	})

	it('should return error response for subscription cancel', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '100004', errorMessage: 'Subscription not found' }),
		)
		const res = await client.subscription.cancel('invalid-ref')

		expect(res.status).toBe('failure')
		expect((res as unknown as { errorCode: string }).errorCode).toBe('100004')
	})
})
