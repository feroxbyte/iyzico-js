import { describe, expect, it } from 'vitest'
import { buildQueryString } from '../../src/lib/query-string.js'

describe('buildQueryString', () => {
	it('should return empty string when params is undefined', () => {
		expect(buildQueryString(undefined)).toBe('')
	})

	it('should return empty string when params is empty object', () => {
		expect(buildQueryString({})).toBe('')
	})

	it('should build query string with single param', () => {
		expect(buildQueryString({ page: 1 })).toBe('?page=1')
	})

	it('should build query string with multiple params', () => {
		const result = buildQueryString({ page: 1, count: 10 })
		expect(result).toContain('page=1')
		expect(result).toContain('count=10')
		expect(result).toMatch(/^\?/)
	})

	it('should skip null values', () => {
		expect(buildQueryString({ page: 1, filter: null })).toBe('?page=1')
	})

	it('should skip undefined values', () => {
		expect(buildQueryString({ page: 1, filter: undefined })).toBe('?page=1')
	})

	it('should return empty string when all values are null/undefined', () => {
		expect(buildQueryString({ a: null, b: undefined })).toBe('')
	})

	it('should convert non-string values to strings', () => {
		expect(buildQueryString({ active: true })).toBe('?active=true')
		expect(buildQueryString({ price: 9.99 })).toBe('?price=9.99')
	})

	it('should encode special characters in values', () => {
		const result = buildQueryString({ name: 'hello world' })
		expect(result).toBe('?name=hello+world')
	})
})
