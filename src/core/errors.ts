/**
 * Base error class for all iyzico-js SDK errors.
 *
 * @remarks
 * These errors represent **transport-level** failures (network, timeout, parse).
 * API-level errors (`status: 'failure'`) are returned as values, not thrown.
 */
export class IyzipayError extends Error {
	override name = 'IyzipayError'
}

/**
 * Thrown when a request exceeds the configured timeout.
 *
 * @example
 * ```ts
 * try {
 *   await iyzipay.payment.create(req)
 * } catch (e) {
 *   if (e instanceof IyzipayTimeoutError) {
 *     console.log(e.timeoutMs) // 30000
 *   }
 * }
 * ```
 */
export class IyzipayTimeoutError extends IyzipayError {
	override name = 'IyzipayTimeoutError'

	constructor(
		readonly timeoutMs: number,
		readonly path: string,
	) {
		super(`Request to ${path} timed out after ${timeoutMs}ms`)
	}
}

/**
 * Thrown when `fetch` fails due to a network error (DNS failure, connection refused, etc.).
 *
 * The original error is available via the standard `cause` property.
 */
export class IyzipayConnectionError extends IyzipayError {
	override name = 'IyzipayConnectionError'

	constructor(
		readonly path: string,
		cause: unknown,
	) {
		super(`Network error on request to ${path}: ${cause instanceof Error ? cause.message : String(cause)}`, {
			cause,
		})
	}
}

/**
 * Thrown when the API response body cannot be parsed as JSON.
 *
 * This typically means iyzico returned an HTML error page (e.g. 502/503)
 * instead of a JSON response.
 */
export class IyzipayParseError extends IyzipayError {
	override name = 'IyzipayParseError'

	constructor(
		readonly httpStatus: number,
		readonly path: string,
		readonly rawBody: string,
		cause: unknown,
	) {
		super(`Expected JSON response from ${path} but got HTTP ${httpStatus}`, { cause })
	}
}
