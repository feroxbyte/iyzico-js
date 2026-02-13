import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  Installment Query
// ═══════════════════════════════════════════════════════════════

describe('installment.query', () => {
	it('should return installment options for a given price and BIN', async () => {
		const res = await sandbox.installment.query({
			locale: 'tr',
			conversationId: randomId(),
			price: '100.0',
			binNumber: '552879',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.installmentDetails).toBeDefined()
			expect(res.installmentDetails.length).toBeGreaterThan(0)

			const detail = res.installmentDetails[0]!
			expect(detail.binNumber).toBeTruthy()
			expect(detail.cardType).toBeTruthy()
			expect(detail.cardAssociation).toBeTruthy()
			expect(detail.bankName).toBeTruthy()
			expect(detail.force3ds).toBeOneOf([0, 1])
			expect(detail.forceCvc).toBeOneOf([0, 1])

			expect(detail.installmentPrices.length).toBeGreaterThan(0)
			for (const price of detail.installmentPrices) {
				expect(price.installmentNumber).toBeGreaterThanOrEqual(1)
				expect(price.totalPrice).toBeGreaterThan(0)
				expect(price.installmentPrice).toBeGreaterThan(0)
			}
		}
	})

	it('should return installment options without a BIN (all banks)', async () => {
		const res = await sandbox.installment.query({
			locale: 'tr',
			conversationId: randomId(),
			price: '100.0',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			// Without BIN, should return options for multiple banks
			expect(res.installmentDetails.length).toBeGreaterThan(1)
		}
	})

	it('should echo conversationId back in response', async () => {
		const convId = `inst-${randomId()}`
		const res = await sandbox.installment.query({
			conversationId: convId,
			price: '50.0',
			binNumber: '552879',
		})

		expect(res.conversationId).toBe(convId)
	})
})
