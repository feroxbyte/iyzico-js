import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { buildCardStorageCard, randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// ═══════════════════════════════════════════════════════════════
//  Card Storage — full lifecycle (create → list → delete)
// ═══════════════════════════════════════════════════════════════

describe('cardStorage', () => {
	it('should register a card for a new user, list it, then delete it', async () => {
		// ── Create (new user) ────────────────────────────────
		const createRes = await sandbox.cardStorage.create({
			locale: 'tr',
			conversationId: randomId(),
			email: `test-${randomId()}@example.com`,
			card: buildCardStorageCard(),
		})

		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		expect(createRes.cardUserKey).toBeTruthy()
		expect(createRes.cardToken).toBeTruthy()
		expect(createRes.binNumber).toContain('552879')
		expect(createRes.lastFourDigits).toBe('0008')
		expect(createRes.cardType).toBeTruthy()
		expect(createRes.cardAssociation).toBe('MASTER_CARD')

		const { cardUserKey, cardToken } = createRes

		// ── List ─────────────────────────────────────────────
		const listRes = await sandbox.cardStorage.list({
			locale: 'tr',
			conversationId: randomId(),
			cardUserKey,
		})

		expect(listRes.status).toBe('success')
		if (listRes.status !== 'success') return

		expect(listRes.cardUserKey).toBe(cardUserKey)
		expect(listRes.cardDetails.length).toBeGreaterThanOrEqual(1)

		const storedCard = listRes.cardDetails.find((c) => c.cardToken === cardToken)
		expect(storedCard).toBeDefined()
		expect(storedCard!.binNumber).toContain('552879')
		expect(storedCard!.lastFourDigits).toBe('0008')

		// ── Delete ───────────────────────────────────────────
		const deleteRes = await sandbox.cardStorage.delete({
			locale: 'tr',
			conversationId: randomId(),
			cardUserKey,
			cardToken,
		})

		expect(deleteRes.status).toBe('success')
	})

	it('should add a second card to an existing user', async () => {
		// Create first card (new user)
		const firstRes = await sandbox.cardStorage.create({
			locale: 'tr',
			conversationId: randomId(),
			email: `test-${randomId()}@example.com`,
			card: buildCardStorageCard(),
		})

		expect(firstRes.status).toBe('success')
		if (firstRes.status !== 'success') return

		const { cardUserKey } = firstRes

		// Add a second card (existing user)
		const secondRes = await sandbox.cardStorage.create({
			locale: 'tr',
			conversationId: randomId(),
			cardUserKey,
			card: buildCardStorageCard({
				cardAlias: 'Second Card',
				cardNumber: '4543590000000006',
				expireYear: '2030',
				expireMonth: '01',
			}),
		})

		expect(secondRes.status).toBe('success')
		if (secondRes.status !== 'success') return

		expect(secondRes.cardUserKey).toBe(cardUserKey)
		expect(secondRes.cardToken).toBeTruthy()
		expect(secondRes.cardToken).not.toBe(firstRes.cardToken)

		// List should show both cards
		const listRes = await sandbox.cardStorage.list({
			locale: 'tr',
			conversationId: randomId(),
			cardUserKey,
		})

		expect(listRes.status).toBe('success')
		if (listRes.status !== 'success') return

		expect(listRes.cardDetails.length).toBeGreaterThanOrEqual(2)

		// Cleanup
		await sandbox.cardStorage.delete({ cardUserKey, cardToken: firstRes.cardToken })
		await sandbox.cardStorage.delete({ cardUserKey, cardToken: secondRes.cardToken })
	})

	it('should forward externalId on create', async () => {
		const externalId = `ext-${randomId()}`

		const res = await sandbox.cardStorage.create({
			locale: 'tr',
			conversationId: randomId(),
			email: `test-${randomId()}@example.com`,
			externalId,
			card: buildCardStorageCard(),
		})

		expect(res.status).toBe('success')
		if (res.status !== 'success') return

		expect(res.externalId).toBe(externalId)

		// Cleanup
		await sandbox.cardStorage.delete({ cardUserKey: res.cardUserKey, cardToken: res.cardToken })
	})

	it('should fail to list with an invalid cardUserKey', async () => {
		const res = await sandbox.cardStorage.list({
			locale: 'tr',
			conversationId: randomId(),
			cardUserKey: 'invalid-key',
		})

		expect(res.status).toBe('failure')
	})

	it('should fail to delete with an invalid cardToken', async () => {
		// Create a card to get a valid cardUserKey
		const createRes = await sandbox.cardStorage.create({
			locale: 'tr',
			conversationId: randomId(),
			email: `test-${randomId()}@example.com`,
			card: buildCardStorageCard(),
		})

		expect(createRes.status).toBe('success')
		if (createRes.status !== 'success') return

		const deleteRes = await sandbox.cardStorage.delete({
			cardUserKey: createRes.cardUserKey,
			cardToken: 'invalid-token',
		})

		expect(deleteRes.status).toBe('failure')

		// Cleanup the real card
		await sandbox.cardStorage.delete({ cardUserKey: createRes.cardUserKey, cardToken: createRes.cardToken })
	})
})
