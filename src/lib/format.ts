/**
 * Formats a price string for Iyzico API compatibility.
 *
 * - Ensures at least one decimal digit: "22" → "22.0"
 * - Strips trailing zeros but keeps at least one: "15.340000" → "15.34", "22.00" → "22.0"
 * - Preserves significant zeros: "23.00450067" → "23.00450067"
 */
/**
 * Strips trailing zeros from a price value for signature verification.
 *
 * Unlike {@link formatPrice} (which always preserves at least one decimal digit),
 * this function removes **all** trailing zeros — including the decimal point itself
 * when no significant decimals remain.
 *
 * @example
 * ```ts
 * stripTrailingZeros('10.50')  // '10.5'
 * stripTrailingZeros('10.0')   // '10'
 * stripTrailingZeros(10.5)     // '10.5'
 * ```
 */
export function stripTrailingZeros(value: string | number): string {
	const str = String(value)
	if (!str.includes('.')) return str

	let i = str.length - 1
	while (i > 0 && str[i] === '0') {
		i--
	}
	if (str[i] === '.') {
		return str.slice(0, i)
	}
	return str.slice(0, i + 1)
}

export function formatPrice(price: string): string {
	if (!price.includes('.')) {
		return `${price}.0`
	}

	let i = price.length - 1
	while (i > 0 && price[i] === '0') {
		i--
	}
	// If we hit the dot, keep one trailing zero
	if (price[i] === '.') {
		return price.slice(0, i + 2)
	}
	return price.slice(0, i + 1)
}
