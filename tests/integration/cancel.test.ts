import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { buildPaymentRequest, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  Cancel
// ═══════════════════════════════════════════════════════════════

describe('cancel.create', () => {
	it('should cancel a payment', async () => {
		// Create a payment first
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		// Cancel the payment
		const cancelRes = await sandbox.cancel.create({
			paymentId: paymentRes.paymentId,
			ip: '85.34.78.112',
		})

		expect(cancelRes.status).toBe('success')
		if (cancelRes.status === 'success') {
			expect(cancelRes.paymentId).toBe(paymentRes.paymentId)
			expect(cancelRes.price).toBeGreaterThan(0)
			expect(cancelRes.currency).toBe('TRY')
		}
	})

	it('should show cancel entry in reporting after cancellation', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const cancelRes = await sandbox.cancel.create({
			paymentId: paymentRes.paymentId,
			ip: '85.34.78.112',
		})
		expect(cancelRes.status).toBe('success')

		// Verify via reporting — the payment should now have a cancel entry
		const report = await sandbox.reporting.getPaymentDetails({
			paymentId: paymentRes.paymentId,
		})
		expect(report.status).toBe('success')
		if (report.status !== 'success') return

		const reported = report.payments[0]!
		expect(String(reported.paymentId)).toBe(String(paymentRes.paymentId))
		expect(reported.cancels).toBeInstanceOf(Array)
		expect(reported.cancels!.length).toBeGreaterThanOrEqual(1)
	})

	it('should fail when cancelling an already-cancelled payment', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const firstCancel = await sandbox.cancel.create({
			paymentId: paymentRes.paymentId,
			ip: '85.34.78.112',
		})
		expect(firstCancel.status).toBe('success')

		// Try to cancel again — should fail
		const secondCancel = await sandbox.cancel.create({
			paymentId: paymentRes.paymentId,
			ip: '85.34.78.112',
		})
		expect(secondCancel.status).toBe('failure')
	})

	it('should cancel a pre-authorized payment without capturing', async () => {
		const preAuth = await sandbox.payment.createPreAuth(buildPaymentRequest())
		expect(preAuth.status).toBe('success')
		if (preAuth.status !== 'success') return
		expect(preAuth.phase).toBe('PRE_AUTH')

		const cancelRes = await sandbox.cancel.create({
			paymentId: preAuth.paymentId,
			ip: '85.34.78.112',
		})
		expect(cancelRes.status).toBe('success')
		if (cancelRes.status === 'success') {
			expect(cancelRes.paymentId).toBe(preAuth.paymentId)
		}
	})
})
