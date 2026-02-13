import { describe, expect, it } from 'vitest'
import { createMockClient, mockErrorResponse, mockSuccessResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

function mockCardCreateResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		cardUserKey: 'card-user-key-abc123',
		cardToken: 'card-token-xyz789',
		binNumber: '552879',
		lastFourDigits: '0008',
		cardType: 'CREDIT_CARD',
		cardAssociation: 'MASTER_CARD',
		cardFamily: 'World',
		cardAlias: 'My Test Card',
		cardBankCode: 64,
		cardBankName: 'İş Bankası',
		email: 'test@example.com',
		...overrides,
	})
}

function mockCardListResponse(overrides?: Record<string, unknown>) {
	return mockSuccessResponse({
		cardUserKey: 'card-user-key-abc123',
		cardDetails: [
			{
				cardToken: 'card-token-xyz789',
				cardAlias: 'My Test Card',
				binNumber: '552879',
				lastFourDigits: '0008',
				cardType: 'CREDIT_CARD',
				cardAssociation: 'MASTER_CARD',
				cardFamily: 'World',
				cardBankCode: 64,
				cardBankName: 'İş Bankası',
				expireMonth: '12',
				expireYear: '2030',
			},
		],
		...overrides,
	})
}

// ═══════════════════════════════════════════════════════════════
//  cardStorage.create
// ═══════════════════════════════════════════════════════════════

describe('cardStorage.create', () => {
	it('should POST to /cardstorage/card with new user (email)', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockCardCreateResponse())

		await client.cardStorage.create({
			email: 'test@example.com',
			card: {
				cardAlias: 'My Test Card',
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
			},
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/cardstorage/card')

		const body = lastBody()
		expect(body.email).toBe('test@example.com')
		expect(body.card.cardHolderName).toBe('John Doe')
		expect(body.card.cardNumber).toBe('5528790000000008')
		expect(body.card.cardAlias).toBe('My Test Card')
	})

	it('should POST to /cardstorage/card with existing user (cardUserKey)', async () => {
		const { client, lastBody } = createMockClient(mockCardCreateResponse())

		await client.cardStorage.create({
			cardUserKey: 'existing-user-key',
			card: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
			},
		})

		const body = lastBody()
		expect(body.cardUserKey).toBe('existing-user-key')
		expect(body.email).toBeUndefined()
		expect(body.card.cardHolderName).toBe('John Doe')
	})

	it('should return card details on success', async () => {
		const { client } = createMockClient(mockCardCreateResponse())

		const res = await client.cardStorage.create({
			email: 'test@example.com',
			card: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
			},
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.cardUserKey).toBe('card-user-key-abc123')
			expect(res.cardToken).toBe('card-token-xyz789')
			expect(res.binNumber).toBe('552879')
			expect(res.lastFourDigits).toBe('0008')
			expect(res.cardType).toBe('CREDIT_CARD')
			expect(res.cardAssociation).toBe('MASTER_CARD')
		}
	})

	it('should return error response on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5126', errorMessage: 'Card user key not found' }),
		)

		const res = await client.cardStorage.create({
			email: 'test@example.com',
			card: {
				cardHolderName: 'John Doe',
				cardNumber: '0000000000000000',
				expireYear: '2030',
				expireMonth: '12',
			},
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5126')
		}
	})

	it('should forward optional externalId', async () => {
		const { client, lastBody } = createMockClient(mockCardCreateResponse({ externalId: 'ext-123' }))

		await client.cardStorage.create({
			email: 'test@example.com',
			externalId: 'ext-123',
			card: {
				cardHolderName: 'John Doe',
				cardNumber: '5528790000000008',
				expireYear: '2030',
				expireMonth: '12',
			},
		})

		expect(lastBody().externalId).toBe('ext-123')
	})
})

// ═══════════════════════════════════════════════════════════════
//  cardStorage.list
// ═══════════════════════════════════════════════════════════════

describe('cardStorage.list', () => {
	it('should POST to /cardstorage/cards with cardUserKey', async () => {
		const { client, lastUrl, lastBody } = createMockClient(mockCardListResponse())

		await client.cardStorage.list({
			cardUserKey: 'card-user-key-abc123',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/cardstorage/cards')
		expect(lastBody().cardUserKey).toBe('card-user-key-abc123')
	})

	it('should return cardDetails array on success', async () => {
		const { client } = createMockClient(mockCardListResponse())

		const res = await client.cardStorage.list({
			cardUserKey: 'card-user-key-abc123',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.cardUserKey).toBe('card-user-key-abc123')
			expect(res.cardDetails).toHaveLength(1)
			expect(res.cardDetails[0]!.cardToken).toBe('card-token-xyz789')
			expect(res.cardDetails[0]!.binNumber).toBe('552879')
			expect(res.cardDetails[0]!.lastFourDigits).toBe('0008')
		}
	})

	it('should return error on failure', async () => {
		const { client } = createMockClient(
			mockErrorResponse({ errorCode: '5126', errorMessage: 'Card user key not found' }),
		)

		const res = await client.cardStorage.list({
			cardUserKey: 'invalid-key',
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5126')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  cardStorage.delete
// ═══════════════════════════════════════════════════════════════

describe('cardStorage.delete', () => {
	it('should send DELETE to /cardstorage/card with cardUserKey and cardToken', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockSuccessResponse())

		await client.cardStorage.delete({
			cardUserKey: 'card-user-key-abc123',
			cardToken: 'card-token-xyz789',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/cardstorage/card')
		expect(lastMethod()).toBe('DELETE')

		const body = lastBody()
		expect(body.cardUserKey).toBe('card-user-key-abc123')
		expect(body.cardToken).toBe('card-token-xyz789')
	})

	it('should return success status', async () => {
		const { client } = createMockClient(mockSuccessResponse())

		const res = await client.cardStorage.delete({
			cardUserKey: 'card-user-key-abc123',
			cardToken: 'card-token-xyz789',
		})

		expect(res.status).toBe('success')
	})

	it('should return error on failure', async () => {
		const { client } = createMockClient(mockErrorResponse({ errorCode: '5128', errorMessage: 'Card token not found' }))

		const res = await client.cardStorage.delete({
			cardUserKey: 'card-user-key-abc123',
			cardToken: 'invalid-token',
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('5128')
			expect(res.errorMessage).toBe('Card token not found')
		}
	})
})
