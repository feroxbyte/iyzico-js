import { describe, expect, it } from 'vitest'
import { Iyzipay } from '../../src/client.js'
import { buildIyzilinkCreateRequest, randomId, SANDBOX_OPTIONS } from '../helpers.js'

const sandbox = new Iyzipay(SANDBOX_OPTIONS)

// Shared state for chained lifecycle tests
let productToken: string

// ═══════════════════════════════════════════════════════════════
//  iyzilink CRUD
// ═══════════════════════════════════════════════════════════════

describe('iyzilink', () => {
	it('should create an iyzilink product', async () => {
		const res = await sandbox.iyzilink.create(buildIyzilinkCreateRequest())

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBeTruthy()
			expect(res.data.url).toBeTruthy()
			expect(res.data.imageUrl).toBeTruthy()
			productToken = res.data.token
		}
	})

	it('should list iyzilink products', async () => {
		const res = await sandbox.iyzilink.list({
			locale: 'tr',
			conversationId: randomId(),
			page: 1,
			count: 10,
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.items).toBeDefined()
			expect(Array.isArray(res.data.items)).toBe(true)
			expect(res.data.totalCount).toBeGreaterThanOrEqual(0)
		}
	})

	it('should retrieve the created iyzilink product', async () => {
		if (!productToken) return

		const res = await sandbox.iyzilink.retrieve(productToken, {
			locale: 'tr',
			conversationId: randomId(),
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBe(productToken)
			expect(res.data.name).toBeTruthy()
			expect(res.data.price).toBeGreaterThan(0)
		}
	})

	it('should update the iyzilink product', async () => {
		if (!productToken) return

		const res = await sandbox.iyzilink.update(productToken, {
			locale: 'tr',
			conversationId: randomId(),
			name: `Updated Widget ${randomId()}`,
			description: 'Updated by integration tests',
			price: '150.0',
			currencyCode: 'TRY',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBeTruthy()
			expect(res.data.url).toBeTruthy()
		}
	})

	it('should update iyzilink product status to PASSIVE', async () => {
		if (!productToken) return

		const res = await sandbox.iyzilink.updateStatus(productToken, 'PASSIVE', {
			locale: 'tr',
			conversationId: randomId(),
		})

		expect(res.status).toBe('success')
	})

	it('should delete the iyzilink product', async () => {
		if (!productToken) return

		const res = await sandbox.iyzilink.delete(productToken, {
			locale: 'tr',
			conversationId: randomId(),
		})

		expect(res.status).toBe('success')
	})
})
