import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { verifyRefundSignature } from '../../src/lib/signature.js'
import { buildPaymentRequest, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  Refund (V1 — per item)
// ═══════════════════════════════════════════════════════════════

describe('refund.create', () => {
	it('should refund the first item of a payment', async () => {
		// Create a payment first
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstItem = paymentRes.itemTransactions[0]!

		// Refund that item
		const refundRes = await sandbox.refund.create({
			paymentTransactionId: firstItem.paymentTransactionId,
			price: String(firstItem.paidPrice),
			ip: '85.34.78.112',
		})

		expect(refundRes.status).toBe('success')
		if (refundRes.status === 'success') {
			expect(refundRes.paymentId).toBe(paymentRes.paymentId)
			expect(refundRes.paymentTransactionId).toBe(firstItem.paymentTransactionId)
			expect(refundRes.price).toBeGreaterThan(0)
			expect(await verifyRefundSignature(SANDBOX_OPTIONS.secretKey, refundRes)).toBe(true)
		}
	})

	it('should show PARTIALLY_REFUNDED status after refunding one item', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstItem = paymentRes.itemTransactions[0]!
		const refundRes = await sandbox.refund.create({
			paymentTransactionId: firstItem.paymentTransactionId,
			price: String(firstItem.paidPrice),
			ip: '85.34.78.112',
		})
		expect(refundRes.status).toBe('success')

		// Verify via reporting
		const report = await sandbox.reporting.getPaymentDetails({
			paymentId: paymentRes.paymentId,
		})
		expect(report.status).toBe('success')
		if (report.status !== 'success') return
		expect(report.payments[0]!.paymentRefundStatus).toBe('PARTIALLY_REFUNDED')
	})

	it('should fail when refunding the same item twice for full amount', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstItem = paymentRes.itemTransactions[0]!
		const price = String(firstItem.paidPrice)

		const firstRefund = await sandbox.refund.create({
			paymentTransactionId: firstItem.paymentTransactionId,
			price,
			ip: '85.34.78.112',
		})
		expect(firstRefund.status).toBe('success')

		// Try the same refund again — should fail
		const secondRefund = await sandbox.refund.create({
			paymentTransactionId: firstItem.paymentTransactionId,
			price,
			ip: '85.34.78.112',
		})
		expect(secondRefund.status).toBe('failure')
	})

	it('should show TOTALLY_REFUNDED after refunding all items', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		// Refund every item
		for (const item of paymentRes.itemTransactions) {
			const refundRes = await sandbox.refund.create({
				paymentTransactionId: item.paymentTransactionId,
				price: String(item.paidPrice),
				ip: '85.34.78.112',
			})
			expect(refundRes.status).toBe('success')
		}

		// Verify via reporting
		const report = await sandbox.reporting.getPaymentDetails({
			paymentId: paymentRes.paymentId,
		})
		expect(report.status).toBe('success')
		if (report.status !== 'success') return
		expect(report.payments[0]!.paymentRefundStatus).toBe('TOTALLY_REFUNDED')
	})
})

// ═══════════════════════════════════════════════════════════════
//  Refund Amount-Based (V2 — by paymentId)
// ═══════════════════════════════════════════════════════════════

describe('refund.createAmountBased', () => {
	// Amount-based refund (V2) requires a "standard" merchant account.
	// The shared sandbox credentials are a marketplace merchant, so this
	// endpoint always returns error 5266: "Tutar bazlı iadeyi sadece
	// standart işyeri kullanabilir." — skip until a standard sandbox is available.
	it.skip('should refund by paymentId', async () => {
		// Create a payment first
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())

		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		// Refund partial amount from the whole payment
		const refundRes = await sandbox.refund.createAmountBased({
			paymentId: paymentRes.paymentId,
			price: '0.3',
			ip: '85.34.78.112',
		})

		expect(refundRes.status).toBe('success')
		if (refundRes.status === 'success') {
			expect(refundRes.paymentId).toBe(paymentRes.paymentId)
			expect(refundRes.price).toBeGreaterThan(0)
		}
	})
})
