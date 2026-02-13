import { describe, expect, it } from 'vitest'
import { formatPrice, stripTrailingZeros } from '../../src/lib/format.js'

describe('stripTrailingZeros', () => {
	it('should return integer strings unchanged', () => {
		expect(stripTrailingZeros('10')).toBe('10')
	})

	it('should strip ".0" entirely', () => {
		expect(stripTrailingZeros('10.0')).toBe('10')
	})

	it('should keep significant decimal digits', () => {
		expect(stripTrailingZeros('10.5')).toBe('10.5')
	})

	it('should strip one trailing zero', () => {
		expect(stripTrailingZeros('10.50')).toBe('10.5')
	})

	it('should strip multiple trailing zeros', () => {
		expect(stripTrailingZeros('10.510')).toBe('10.51')
	})

	it('should preserve all significant digits', () => {
		expect(stripTrailingZeros('10.5105')).toBe('10.5105')
	})

	it('should strip trailing zeros after significant digits', () => {
		expect(stripTrailingZeros('10.51050')).toBe('10.5105')
	})

	it('should strip many trailing zeros', () => {
		expect(stripTrailingZeros('1.000000')).toBe('1')
	})

	// Number inputs
	it('should handle number input with no decimals', () => {
		expect(stripTrailingZeros(10)).toBe('10')
	})

	it('should handle number input with trailing zero', () => {
		// JS number 10.0 becomes "10" via String(), no dot
		expect(stripTrailingZeros(10.0)).toBe('10')
	})

	it('should handle number input with significant decimals', () => {
		expect(stripTrailingZeros(10.5)).toBe('10.5')
	})

	it('should handle number input with multiple decimals', () => {
		expect(stripTrailingZeros(10.51)).toBe('10.51')
	})
})

describe('formatPrice', () => {
	it('should add .0 to integers', () => {
		expect(formatPrice('22')).toBe('22.0')
	})

	it('should keep at least one decimal when all zeros', () => {
		expect(formatPrice('22.00')).toBe('22.0')
	})

	it('should strip trailing zeros but keep significant digits', () => {
		expect(formatPrice('15.340000')).toBe('15.34')
	})

	it('should preserve all significant digits', () => {
		expect(formatPrice('23.00450067')).toBe('23.00450067')
	})

	it('should keep single significant decimal', () => {
		expect(formatPrice('10.5')).toBe('10.5')
	})

	it('should strip one trailing zero', () => {
		expect(formatPrice('10.50')).toBe('10.5')
	})

	it('should keep .0 when input is X.0', () => {
		expect(formatPrice('1.0')).toBe('1.0')
	})

	it('should handle many trailing zeros after dot', () => {
		expect(formatPrice('1.000000')).toBe('1.0')
	})
})
