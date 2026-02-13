import { hmacSha256Hex, timingSafeEqual } from './crypto.js'
import { stripTrailingZeros } from './format.js'

// ─── Internal helpers ───────────────────────────────────────────

/**
 * Join parameter values with `:` separator, stripping trailing zeros at
 * price positions and mapping `undefined`/`null` to empty string.
 */
function joinParams(values: (string | number | undefined | null)[], priceIndices: number[]): string {
	return values
		.map((v, i) => {
			if (v == null) return ''
			return priceIndices.includes(i) ? stripTrailingZeros(v) : String(v)
		})
		.join(':')
}

/** Compute HMAC and compare with the response signature in constant time. */
async function verify(secretKey: string, message: string, signature: string): Promise<boolean> {
	const expected = await hmacSha256Hex(secretKey, message)
	return timingSafeEqual(expected, signature)
}

// ─── Payment (Non-3DS / PostAuth) ───────────────────────────────

/**
 * Verify the `signature` field of a Non-3DS payment, pre-auth, or post-auth response.
 *
 * @param secretKey - Your iyzico secret key
 * @param response  - The API response object (must contain the fields used for signing)
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * const result = await iyzipay.payment.create(request)
 * const valid = await verifyPaymentSignature(secretKey, result)
 * if (!valid) throw new Error('Response signature mismatch')
 * ```
 */
export async function verifyPaymentSignature(
	secretKey: string,
	response: {
		paymentId: string
		currency: string
		basketId?: string
		conversationId?: string
		paidPrice: number
		price: number
		signature: string
	},
): Promise<boolean> {
	const message = joinParams(
		[
			response.paymentId,
			response.currency,
			response.basketId,
			response.conversationId,
			response.paidPrice,
			response.price,
		],
		[4, 5],
	)
	return verify(secretKey, message, response.signature)
}

// ─── 3DS Initialize ─────────────────────────────────────────────

/**
 * Verify the `signature` field of a 3DS initialize response.
 *
 * @param secretKey - Your iyzico secret key
 * @param response  - The 3DS initialize response
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * const init = await iyzipay.payment.threeds.initialize(request)
 * const valid = await verifyThreeDSInitSignature(secretKey, init)
 * ```
 */
export async function verifyThreeDSInitSignature(
	secretKey: string,
	response: {
		paymentId: string
		conversationId?: string
		signature: string
	},
): Promise<boolean> {
	const message = joinParams([response.paymentId, response.conversationId], [])
	return verify(secretKey, message, response.signature)
}

// ─── 3DS Auth (Complete) ────────────────────────────────────────

/**
 * Verify the `signature` field of a 3DS auth (complete) response.
 * Alias for {@link verifyPaymentSignature} — the response has the same signed fields.
 */
export const verifyThreeDSAuthSignature = verifyPaymentSignature

// ─── 3DS Callback ───────────────────────────────────────────────

/**
 * Verify the signature of the 3DS callback POST body.
 *
 * @param secretKey - Your iyzico secret key
 * @param callback  - The callback POST body fields
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * // In your callback route handler:
 * const valid = await verifyCallbackSignature(secretKey, req.body)
 * ```
 */
export async function verifyCallbackSignature(
	secretKey: string,
	callback: {
		conversationData?: string
		conversationId?: string
		mdStatus: string
		paymentId: string
		status: string
		signature: string
	},
): Promise<boolean> {
	const message = joinParams(
		[callback.conversationData, callback.conversationId, callback.mdStatus, callback.paymentId, callback.status],
		[],
	)
	return verify(secretKey, message, callback.signature)
}

// ─── Checkout Form Initialize ───────────────────────────────────

/**
 * Verify the `signature` field of a Checkout Form initialize response.
 *
 * @param secretKey - Your iyzico secret key
 * @param response  - The Checkout Form initialize response
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * const form = await iyzipay.payment.checkout.initialize(request)
 * const valid = await verifyFormInitSignature(secretKey, form)
 * ```
 */
export async function verifyFormInitSignature(
	secretKey: string,
	response: {
		conversationId?: string
		token: string
		signature: string
	},
): Promise<boolean> {
	const message = joinParams([response.conversationId, response.token], [])
	return verify(secretKey, message, response.signature)
}

// ─── Checkout Form Retrieve ─────────────────────────────────────

/**
 * Verify the `signature` field of a Checkout Form retrieve response.
 *
 * @param secretKey - Your iyzico secret key
 * @param response  - The Checkout Form retrieve response
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * const result = await iyzipay.payment.checkout.retrieve({ token })
 * const valid = await verifyFormRetrieveSignature(secretKey, result)
 * ```
 */
export async function verifyFormRetrieveSignature(
	secretKey: string,
	response: {
		paymentStatus: string
		paymentId: string
		currency: string
		basketId?: string
		conversationId?: string
		paidPrice: number
		price: number
		token: string
		signature: string
	},
): Promise<boolean> {
	const message = joinParams(
		[
			response.paymentStatus,
			response.paymentId,
			response.currency,
			response.basketId,
			response.conversationId,
			response.paidPrice,
			response.price,
			response.token,
		],
		[5, 6],
	)
	return verify(secretKey, message, response.signature)
}

// ─── Refund ─────────────────────────────────────────────────────

/**
 * Verify the `signature` field of a refund response (V1 or V2).
 *
 * @param secretKey - Your iyzico secret key
 * @param response  - The refund response
 * @returns `true` if the signature is valid
 *
 * @example
 * ```ts
 * const refund = await iyzipay.refund.create(request)
 * const valid = await verifyRefundSignature(secretKey, refund)
 * ```
 */
export async function verifyRefundSignature(
	secretKey: string,
	response: {
		paymentId: string
		price: number
		currency: string
		conversationId?: string
		signature: string
	},
): Promise<boolean> {
	const message = joinParams([response.paymentId, response.price, response.currency, response.conversationId], [1])
	return verify(secretKey, message, response.signature)
}
