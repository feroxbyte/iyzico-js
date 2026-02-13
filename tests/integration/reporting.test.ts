import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { buildPaymentRequest, randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  reporting.getPaymentDetails
// ═══════════════════════════════════════════════════════════════

describe('reporting.getPaymentDetails', () => {
	it('should return payment details by paymentId', async () => {
		// Create a payment first so we have a valid paymentId to query
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const res = await sandbox.reporting.getPaymentDetails({
			paymentId: paymentRes.paymentId,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.payments).toBeInstanceOf(Array)
			expect(res.payments.length).toBeGreaterThanOrEqual(1)
			const payment = res.payments[0]!
			expect(String(payment.paymentId)).toBe(String(paymentRes.paymentId))
			expect(payment.currency).toBe('TRY')
			expect(payment.itemTransactions).toBeInstanceOf(Array)
		}
	})

	it('should return payment details by paymentConversationId', async () => {
		const convId = `report-${randomId()}`
		const paymentRes = await sandbox.payment.create(buildPaymentRequest({ conversationId: convId }))
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const res = await sandbox.reporting.getPaymentDetails({
			paymentConversationId: convId,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.payments.length).toBeGreaterThanOrEqual(1)
		}
	})

	it('should echo conversationId back in response', async () => {
		const paymentRes = await sandbox.payment.create(buildPaymentRequest())
		expect(paymentRes.status).toBe('success')
		if (paymentRes.status !== 'success') return

		const convId = `echo-${randomId()}`
		const res = await sandbox.reporting.getPaymentDetails({
			paymentId: paymentRes.paymentId,
			conversationId: convId,
		})

		expect(res.conversationId).toBe(convId)
	})

	// TODO: Implement — see comment below
	it('should fail when neither paymentId nor paymentConversationId is provided', async () => {
		const res = await sandbox.reporting.getPaymentDetails({})

		expect(res.status).toBe('failure')
	})
})

// ═══════════════════════════════════════════════════════════════
//  reporting.getDailyTransactions
// ═══════════════════════════════════════════════════════════════

describe('reporting.getDailyTransactions', () => {
	// TODO: Implement — see comment below
	it('should return paginated transactions for today', async () => {
		const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

		const res = await sandbox.reporting.getDailyTransactions({
			page: 1,
			transactionDate: today,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.transactions).toBeInstanceOf(Array)
			// currentPage / totalPageCount are only present when results exist
			if (res.transactions.length > 0) {
				expect(res.currentPage).toBe(1)
				expect(typeof res.totalPageCount).toBe('number')
			}
		}
	})

	it('should echo conversationId back in response', async () => {
		const today = new Date().toISOString().slice(0, 10)
		const convId = `daily-${randomId()}`

		const res = await sandbox.reporting.getDailyTransactions({
			page: 1,
			transactionDate: today,
			conversationId: convId,
		})

		expect(res.conversationId).toBe(convId)
	})
})
