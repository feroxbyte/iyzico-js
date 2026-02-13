import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import {
	buildLimitedCompanySubMerchantRequest,
	buildMarketplacePaymentRequest,
	buildPersonalSubMerchantRequest,
	randomId,
	SANDBOX_OPTIONS,
} from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  Sub-Merchant Create
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.create', () => {
	it('should create a personal sub-merchant', async () => {
		const res = await sandbox.marketplace.subMerchant.create(buildPersonalSubMerchantRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.subMerchantKey).toBeTruthy()
		}
	})

	it('should create a limited company sub-merchant', async () => {
		const res = await sandbox.marketplace.subMerchant.create(buildLimitedCompanySubMerchantRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.subMerchantKey).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Sub-Merchant Update
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.update', () => {
	it('should update an existing sub-merchant', async () => {
		const createRes = await sandbox.marketplace.subMerchant.create(buildPersonalSubMerchantRequest())
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const updateRes = await sandbox.marketplace.subMerchant.update({
			subMerchantKey: createRes.subMerchantKey,
			name: 'Updated Store Name',
			email: 'updated@merchant.com',
			gsmNumber: '+905350000000',
			address: 'Updated Address, Kadikoy, Istanbul',
			iban: 'TR180006200119000006672315',
			contactName: 'John',
			contactSurname: 'Doe',
			identityNumber: '74300864791',
		})

		expect(updateRes.status).toBe('success')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Sub-Merchant Retrieve
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.retrieve', () => {
	it('should retrieve a sub-merchant by externalId', async () => {
		const externalId = `sub-${randomId()}`
		const createRes = await sandbox.marketplace.subMerchant.create(
			buildPersonalSubMerchantRequest({ subMerchantExternalId: externalId }),
		)
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const res = await sandbox.marketplace.subMerchant.retrieve({ subMerchantExternalId: externalId })

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.subMerchantKey).toBe(createRes.subMerchantKey)
			expect(res.subMerchantExternalId).toBe(externalId)
			expect(res.email).toBe('sub@merchant.com')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Item Payout Update
// ═══════════════════════════════════════════════════════════════

describe('marketplace.subMerchant.updatePayoutItem', () => {
	it('should update the payout amount on a payment item', async () => {
		// 1. Create sub-merchant
		const createRes = await sandbox.marketplace.subMerchant.create(buildPersonalSubMerchantRequest())
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		// 2. Make a marketplace payment
		const paymentRes = await sandbox.payment.create(buildMarketplacePaymentRequest(createRes.subMerchantKey))
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		// 3. Update payout amount on first item
		const firstItem = paymentRes.itemTransactions[0]!
		const updateRes = await sandbox.marketplace.subMerchant.updatePayoutItem({
			paymentTransactionId: firstItem.paymentTransactionId,
			subMerchantKey: createRes.subMerchantKey,
			subMerchantPrice: 0.29,
		})

		expect(updateRes.status).toBe('success')
		if (updateRes.status === 'success') {
			expect(updateRes.paymentTransactionId).toBe(firstItem.paymentTransactionId)
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  Approval
// ═══════════════════════════════════════════════════════════════

describe('marketplace.approval', () => {
	it('should approve a payment item', async () => {
		const createRes = await sandbox.marketplace.subMerchant.create(buildPersonalSubMerchantRequest())
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const paymentRes = await sandbox.payment.create(buildMarketplacePaymentRequest(createRes.subMerchantKey))
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstItem = paymentRes.itemTransactions[0]!
		const approvalRes = await sandbox.marketplace.approval.approve({
			paymentTransactionId: firstItem.paymentTransactionId,
		})

		expect(approvalRes.status).toBe('success')
		if (approvalRes.status === 'success') {
			expect(approvalRes.paymentTransactionId).toBe(firstItem.paymentTransactionId)
		}
	})

	it('should disapprove a previously approved payment item', async () => {
		const createRes = await sandbox.marketplace.subMerchant.create(buildPersonalSubMerchantRequest())
		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const paymentRes = await sandbox.payment.create(buildMarketplacePaymentRequest(createRes.subMerchantKey))
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstItem = paymentRes.itemTransactions[0]!

		// Approve first
		const approvalRes = await sandbox.marketplace.approval.approve({
			paymentTransactionId: firstItem.paymentTransactionId,
		})
		expect(approvalRes.status).toBe('success')

		// Then disapprove
		const disapprovalRes = await sandbox.marketplace.approval.disapprove({
			paymentTransactionId: firstItem.paymentTransactionId,
		})

		expect(disapprovalRes.status).toBe('success')
		if (disapprovalRes.status === 'success') {
			expect(disapprovalRes.paymentTransactionId).toBe(firstItem.paymentTransactionId)
		}
	})
})
