import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  BIN Check
// ═══════════════════════════════════════════════════════════════

describe('bin.check', () => {
	it('should return card metadata for a valid Mastercard BIN', async () => {
		const res = await sandbox.bin.check({
			locale: 'tr',
			conversationId: randomId(),
			binNumber: '552879',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.binNumber).toBe('552879')
			expect(res.cardType).toBeTruthy()
			expect(res.cardAssociation).toBe('MASTER_CARD')
			expect(res.bankName).toBeTruthy()
			expect(res.bankCode).toBeGreaterThan(0)
			expect(res.commercial).toBeOneOf([0, 1])
		}
	})

	it('should return card metadata for a valid Visa BIN', async () => {
		const res = await sandbox.bin.check({
			locale: 'tr',
			conversationId: randomId(),
			binNumber: '454671',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.binNumber).toBe('454671')
			expect(res.cardAssociation).toBe('VISA')
		}
	})

	it('should fail with an invalid BIN number', async () => {
		const res = await sandbox.bin.check({
			locale: 'tr',
			conversationId: randomId(),
			binNumber: '000000',
		})

		expect(res.status).toBe('failure')
	})

	it('should echo conversationId back in response', async () => {
		const convId = `bin-${randomId()}`
		const res = await sandbox.bin.check({
			conversationId: convId,
			binNumber: '552879',
		})

		expect(res.conversationId).toBe(convId)
	})
})
