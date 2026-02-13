import { describe, expect, it } from 'vitest'
import { createMockClient, mockDataResponse, mockErrorResponse, mockPaginatedResponse } from '../test-utils.js'

// ─── Mock Response Factories ─────────────────────────────────

const iyzilinkProduct = {
	name: 'Premium Widget',
	description: 'A high-quality widget',
	price: 100.0,
	currencyCode: 'TRY',
	currencyId: 1,
	token: 'mock-token-123',
	productType: 'IYZILINK',
	productStatus: 'ACTIVE',
	merchantId: 12345,
	url: 'https://iyzi.link/mock-token-123',
	imageUrl: 'https://sandbox-images.iyzipay.com/product/mock.png',
	addressIgnorable: true,
	soldCount: 0,
	installmentRequested: false,
	stockEnabled: false,
	stockCount: 0,
	presetPriceValues: [],
	flexibleLink: false,
	categoryType: 'UNKNOWN',
}

function mockCreateOrUpdateResponse() {
	return mockDataResponse({
		token: 'mock-token-123',
		url: 'https://iyzi.link/mock-token-123',
		imageUrl: 'https://sandbox-images.iyzipay.com/product/mock.png',
	})
}

function mockProductResponse() {
	return mockDataResponse(iyzilinkProduct)
}

function mockListResponse() {
	return mockPaginatedResponse([iyzilinkProduct], { listingReviewed: true })
}

function mockBaseSuccessResponse() {
	return mockDataResponse({})
}

// ═══════════════════════════════════════════════════════════════
//  iyzilink.create
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.create', () => {
	it('should POST to /v2/iyzilink/products', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockCreateOrUpdateResponse())

		await client.iyzilink.create({
			name: 'Premium Widget',
			description: 'A high-quality widget',
			price: '100.0',
			currencyCode: 'TRY',
			encodedImageFile: 'iVBORw0KGgoAAAANSUhEUg==',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().name).toBe('Premium Widget')
		expect(lastBody().price).toBe('100.0')
		expect(lastBody().encodedImageFile).toBe('iVBORw0KGgoAAAANSUhEUg==')
	})

	it('should return create data on success', async () => {
		const { client } = createMockClient(mockCreateOrUpdateResponse())

		const res = await client.iyzilink.create({
			name: 'Premium Widget',
			description: 'A high-quality widget',
			price: '100.0',
			currencyCode: 'TRY',
			encodedImageFile: 'iVBORw0KGgoAAAANSUhEUg==',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBe('mock-token-123')
			expect(res.data.url).toBeTruthy()
			expect(res.data.imageUrl).toBeTruthy()
		}
	})

	it('should return error on failure', async () => {
		const { client } = createMockClient(mockErrorResponse({ errorCode: '100004', errorMessage: 'Product not found' }))

		const res = await client.iyzilink.create({
			name: 'Widget',
			description: 'Desc',
			price: '100.0',
			currencyCode: 'TRY',
			encodedImageFile: 'abc',
		})

		expect(res.status).toBe('failure')
		if (res.status === 'failure') {
			expect(res.errorCode).toBe('100004')
			expect(res.errorMessage).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.createFastLink
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.createFastLink', () => {
	it('should POST to /v2/iyzilink/fast-link/products', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockCreateOrUpdateResponse())

		await client.iyzilink.createFastLink({
			price: '50.0',
			currencyCode: 'TRY',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/fast-link/products')
		expect(lastMethod()).toBe('POST')
		expect(lastBody().price).toBe('50.0')
		expect(lastBody().currencyCode).toBe('TRY')
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.list
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.list', () => {
	it('should GET /v2/iyzilink/products with query params', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockListResponse())

		await client.iyzilink.list({ page: 1, count: 10, locale: 'tr' })

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products?page=1&count=10&locale=tr')
		expect(lastMethod()).toBe('GET')
	})

	it('should GET /v2/iyzilink/products without params', async () => {
		const { client, lastUrl } = createMockClient(mockListResponse())

		await client.iyzilink.list()

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products')
	})

	it('should return paginated data on success', async () => {
		const { client } = createMockClient(mockListResponse())

		const res = await client.iyzilink.list()

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.totalCount).toBe(1)
			expect(res.data.items).toHaveLength(1)
			expect(res.data.items[0]!.name).toBe('Premium Widget')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.retrieve
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.retrieve', () => {
	it('should GET /v2/iyzilink/products/{token}', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockProductResponse())

		await client.iyzilink.retrieve('mock-token-123')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123')
		expect(lastMethod()).toBe('GET')
	})

	it('should append query params', async () => {
		const { client, lastUrl } = createMockClient(mockProductResponse())

		await client.iyzilink.retrieve('mock-token-123', { locale: 'tr', conversationId: 'conv-1' })

		expect(lastUrl()).toBe(
			'https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123?locale=tr&conversationId=conv-1',
		)
	})

	it('should return product data on success', async () => {
		const { client } = createMockClient(mockProductResponse())

		const res = await client.iyzilink.retrieve('mock-token-123')

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBe('mock-token-123')
			expect(res.data.name).toBe('Premium Widget')
			expect(res.data.productType).toBe('IYZILINK')
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.update
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.update', () => {
	it('should PUT to /v2/iyzilink/products/{token}', async () => {
		const { client, lastUrl, lastBody, lastMethod } = createMockClient(mockCreateOrUpdateResponse())

		await client.iyzilink.update('mock-token-123', {
			name: 'Updated Widget',
			description: 'Now even better',
			price: '120.0',
			currencyCode: 'TRY',
		})

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123')
		expect(lastMethod()).toBe('PUT')
		expect(lastBody().name).toBe('Updated Widget')
		expect(lastBody().price).toBe('120.0')
	})

	it('should return update data on success', async () => {
		const { client } = createMockClient(mockCreateOrUpdateResponse())

		const res = await client.iyzilink.update('mock-token-123', {
			name: 'Updated Widget',
			description: 'Desc',
			price: '120.0',
			currencyCode: 'TRY',
		})

		expect(res.status).toBe('success')
		if (res.status === 'success') {
			expect(res.data.token).toBe('mock-token-123')
			expect(res.data.url).toBeTruthy()
		}
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.updateStatus
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.updateStatus', () => {
	it('should PATCH /v2/iyzilink/products/{token}/status/{status}', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockBaseSuccessResponse())

		await client.iyzilink.updateStatus('mock-token-123', 'PASSIVE')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123/status/PASSIVE')
		expect(lastMethod()).toBe('PATCH')
	})

	it('should append query params', async () => {
		const { client, lastUrl } = createMockClient(mockBaseSuccessResponse())

		await client.iyzilink.updateStatus('mock-token-123', 'ACTIVE', { locale: 'tr' })

		expect(lastUrl()).toBe(
			'https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123/status/ACTIVE?locale=tr',
		)
	})

	it('should not send a body', async () => {
		const { client, lastHasBody } = createMockClient(mockBaseSuccessResponse())

		await client.iyzilink.updateStatus('mock-token-123', 'PASSIVE')

		expect(lastHasBody()).toBe(false)
	})
})

// ═══════════════════════════════════════════════════════════════
//  iyzilink.delete
// ═══════════════════════════════════════════════════════════════

describe('iyzilink.delete', () => {
	it('should DELETE /v2/iyzilink/products/{token}', async () => {
		const { client, lastUrl, lastMethod } = createMockClient(mockBaseSuccessResponse())

		await client.iyzilink.delete('mock-token-123')

		expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123')
		expect(lastMethod()).toBe('DELETE')
	})

	it('should append query params', async () => {
		const { client, lastUrl } = createMockClient(mockBaseSuccessResponse())

		await client.iyzilink.delete('mock-token-123', { locale: 'tr', conversationId: 'conv-1' })

		expect(lastUrl()).toBe(
			'https://sandbox-api.iyzipay.com/v2/iyzilink/products/mock-token-123?locale=tr&conversationId=conv-1',
		)
	})

	it('should return base success response', async () => {
		const { client } = createMockClient(mockBaseSuccessResponse())

		const res = await client.iyzilink.delete('mock-token-123')

		expect(res.status).toBe('success')
	})
})
