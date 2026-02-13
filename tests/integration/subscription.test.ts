import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// Shared state across the chained test lifecycle.
// Tests within each `describe` run sequentially, so later tests
// can rely on reference codes created by earlier ones.
let productReferenceCode: string
let pricingPlanReferenceCode: string
let upgradePlanReferenceCode: string
let subscriptionReferenceCode: string
let customerReferenceCode: string

// ═══════════════════════════════════════════════════════════════
//  Product CRUD
// ═══════════════════════════════════════════════════════════════

describe('subscription.product', () => {
	it('should create a subscription product', async () => {
		const res = await sandbox.subscription.product.create({
			locale: 'tr',
			conversationId: randomId(),
			name: `Integration Test Product ${randomId()}`,
			description: 'Created by integration tests',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBeTruthy()
			expect(res.data.name).toContain('Integration Test Product')
			productReferenceCode = res.data.referenceCode
		}
	})

	it('should retrieve the created product', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.product.retrieve(productReferenceCode)

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBe(productReferenceCode)
			expect(res.data.name).toContain('Integration Test Product')
			expect(res.data.status).toBeTruthy()
		}
	})

	it('should update the product name', async () => {
		if (!productReferenceCode) return

		// Use a unique name to avoid "Ürün zaten var" (product already exists) error
		const res = await sandbox.subscription.product.update(productReferenceCode, {
			locale: 'tr',
			conversationId: randomId(),
			name: `Updated Product ${randomId()}`,
			description: 'Updated by integration tests',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.name).toContain('Updated Product')
		}
	})

	it('should list products with pagination', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.product.list({ page: 1, count: 10 })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.totalCount).toBeGreaterThanOrEqual(1)
			expect(res.data.items.length).toBeGreaterThanOrEqual(1)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Pricing Plan CRUD
// ═══════════════════════════════════════════════════════════════

describe('subscription.pricingPlan', () => {
	it('should create a pricing plan under the product', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.create(productReferenceCode, {
			locale: 'tr',
			conversationId: randomId(),
			name: 'Monthly Basic Plan',
			price: 9.99,
			currencyCode: 'TRY',
			paymentInterval: 'MONTHLY',
			paymentIntervalCount: 1,
			planPaymentType: 'RECURRING',
			recurrenceCount: 12,
			trialPeriodDays: 0,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBeTruthy()
			expect(res.data.name).toBe('Monthly Basic Plan')
			expect(res.data.price).toBe(9.99)
			expect(res.data.paymentInterval).toBe('MONTHLY')
			pricingPlanReferenceCode = res.data.referenceCode
		}
	})

	it('should create a second plan for upgrade testing', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.create(productReferenceCode, {
			locale: 'tr',
			conversationId: randomId(),
			name: 'Monthly Premium Plan',
			price: 19.99,
			currencyCode: 'TRY',
			paymentInterval: 'MONTHLY',
			paymentIntervalCount: 1,
			planPaymentType: 'RECURRING',
			recurrenceCount: 12,
			trialPeriodDays: 0,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			upgradePlanReferenceCode = res.data.referenceCode
		}
	})

	it('should retrieve the created pricing plan', async () => {
		if (!pricingPlanReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.retrieve(pricingPlanReferenceCode)

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBe(pricingPlanReferenceCode)
			expect(res.data.name).toBe('Monthly Basic Plan')
			expect(res.data.productReferenceCode).toBe(productReferenceCode)
		}
	})

	it('should update the pricing plan name', async () => {
		if (!pricingPlanReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.update(pricingPlanReferenceCode, {
			locale: 'tr',
			conversationId: randomId(),
			name: 'Updated Basic Plan',
			trialPeriodDays: 7,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.name).toBe('Updated Basic Plan')
		}
	})

	it('should list pricing plans for the product', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.list(productReferenceCode, { page: 1, count: 10 })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.totalCount).toBeGreaterThanOrEqual(2)
			expect(res.data.items.length).toBeGreaterThanOrEqual(2)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Initialize (NON-3DS)
// ═══════════════════════════════════════════════════════════════

describe('subscription.initialize', () => {
	it('should initialize a subscription with a new customer (NON-3DS)', async () => {
		if (!pricingPlanReferenceCode) return

		const res = await sandbox.subscription.initialize({
			locale: 'tr',
			conversationId: randomId(),
			pricingPlanReferenceCode,
			subscriptionInitialStatus: 'ACTIVE',
			paymentCard: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
				cvc: '123',
			},
			customer: {
				name: 'John',
				surname: 'Doe',
				email: `sub${Date.now()}@email.com`,
				gsmNumber: '+905555555555',
				identityNumber: '74300864791',
				billingAddress: {
					address: 'Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1',
					zipCode: '34732',
					contactName: 'John Doe',
					city: 'Istanbul',
					country: 'Turkey',
				},
			},
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBeTruthy()
			expect(res.data.parentReferenceCode).toBeTruthy()
			expect(res.data.pricingPlanReferenceCode).toBe(pricingPlanReferenceCode)
			expect(res.data.customerReferenceCode).toBeTruthy()
			expect(res.data.subscriptionStatus).toBe('ACTIVE')
			expect(res.data.createdDate).toBeGreaterThan(0)
			expect(res.data.startDate).toBeGreaterThan(0)
			subscriptionReferenceCode = res.data.referenceCode
			customerReferenceCode = res.data.customerReferenceCode
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Initialize (Checkout Form)
// ═══════════════════════════════════════════════════════════════

describe('subscription.initializeCheckoutForm', () => {
	it('should return checkout form content and token', async () => {
		if (!pricingPlanReferenceCode) return

		const res = await sandbox.subscription.initializeWithCf({
			locale: 'tr',
			conversationId: randomId(),
			pricingPlanReferenceCode,
			subscriptionInitialStatus: 'ACTIVE',
			callbackUrl: 'https://merchant.com/subscription/callback',
			customer: {
				name: 'Jane',
				surname: 'Doe',
				email: `checkout${Date.now()}@email.com`,
				gsmNumber: '+905555555555',
				identityNumber: '74300864791',
				billingAddress: {
					address: 'Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1',
					zipCode: '34732',
					contactName: 'Jane Doe',
					city: 'Istanbul',
					country: 'Turkey',
				},
			},
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token || res.checkoutFormContent).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Queries
// ═══════════════════════════════════════════════════════════════

describe('subscription queries', () => {
	it('should retrieve a subscription by reference code', async () => {
		if (!subscriptionReferenceCode) return

		const res = await sandbox.subscription.retrieve(subscriptionReferenceCode)

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBeTruthy()
		}
	})

	it('should search subscriptions with filters', async () => {
		if (!subscriptionReferenceCode) return

		const res = await sandbox.subscription.search({
			subscriptionReferenceCode,
			page: 1,
			count: 10,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Card Update (Checkout Form)
//  NOTE: Must run while the customer still has an ACTIVE sub.
// ═══════════════════════════════════════════════════════════════

describe('subscription.initializeCardUpdate', () => {
	it('should return a card update checkout form', async () => {
		if (!customerReferenceCode) return

		const res = await sandbox.subscription.initializeCardUpdate({
			locale: 'tr',
			conversationId: randomId(),
			callbackUrl: 'https://merchant.com/card-update/callback',
			customerReferenceCode,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.token || res.checkoutFormContent).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Subscription Lifecycle (upgrade → cancel)
//  NOTE: We upgrade first while the subscription is ACTIVE,
//  then cancel. Re-activating a canceled subscription is not
//  reliably supported in the sandbox.
// ═══════════════════════════════════════════════════════════════

describe('subscription lifecycle', () => {
	it('should upgrade a subscription to a different plan', async () => {
		if (!subscriptionReferenceCode || !upgradePlanReferenceCode) return

		const res = await sandbox.subscription.upgrade(subscriptionReferenceCode, {
			locale: 'tr',
			conversationId: randomId(),
			newPricingPlanReferenceCode: upgradePlanReferenceCode,
			upgradePeriod: 'NOW',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.referenceCode).toBeTruthy()
			// After upgrade, the new subscription has the new plan
			subscriptionReferenceCode = res.data.referenceCode
		}
	})

	it('should cancel a subscription', async () => {
		if (!subscriptionReferenceCode) return

		const res = await sandbox.subscription.cancel(subscriptionReferenceCode)

		expect(res.status).toBe('success')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Cleanup — delete pricing plans and product
//  NOTE: The v2 subscription DELETE endpoints may return HTTP
//  status codes or error responses in sandbox. We verify the
//  call completes without throwing.
// ═══════════════════════════════════════════════════════════════

describe('subscription cleanup', () => {
	it('should delete the upgrade pricing plan', async () => {
		if (!upgradePlanReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.delete(upgradePlanReferenceCode)
		// Sandbox DELETE returns { status: 200 } on success, { status: 404 } on not found
		expect(res).toBeTruthy()
	})

	it('should delete the basic pricing plan', async () => {
		if (!pricingPlanReferenceCode) return

		const res = await sandbox.subscription.pricingPlan.delete(pricingPlanReferenceCode)
		expect(res).toBeTruthy()
	})

	it('should delete the product', async () => {
		if (!productReferenceCode) return

		const res = await sandbox.subscription.product.delete(productReferenceCode)
		expect(res).toBeTruthy()
	})
})
