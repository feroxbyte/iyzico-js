/**
 * Modern TypeScript client for the iyzico payment API.
 *
 * @remarks
 * Zero-dependency SDK using only `fetch` and Web Crypto API — runs in Node.js 18+,
 * Deno, Bun, and Cloudflare Workers.
 *
 * Access all payment flows through the `Iyzipay` class:
 *
 * | Namespace | Operations |
 * |-----------|-----------|
 * | `payment` | Non-3DS, 3D Secure, Checkout Form, Pay with iyzico, pre/post-auth |
 * | `marketplace` | Sub-merchant CRUD, basket-item approval for payout |
 * | `subscription` | Products, pricing plans, recurring payment lifecycle |
 * | `refund` | Item-based (V1) and amount-based (V2) refunds |
 * | `cancel` | Same-day full payment cancellation (void) |
 * | `bin` | BIN (Bank Identification Number) lookup |
 * | `installment` | Installment plan query |
 * | `iyzilink` | Payment link (iyzilink / fastlink) management |
 *
 * @example
 * ```ts
 * import { Iyzipay } from 'iyzico-js'
 *
 * const iyzipay = new Iyzipay({
 *   apiKey: 'sandbox-...',
 *   secretKey: 'sandbox-...',
 *   baseUrl: 'https://sandbox-api.iyzipay.com',
 * })
 *
 * // Non-3DS payment
 * const payment = await iyzipay.payment.create({ price: '100.0', ... })
 *
 * // 3D Secure (two steps)
 * const init = await iyzipay.payment.threeds.initialize({ callbackUrl: '...', ... })
 * // → render init.threeDSHtmlContent in browser → callback → complete:
 * const result = await iyzipay.payment.threeds.create({ paymentId: '...' })
 * ```
 *
 * @see https://docs.iyzico.com
 *
 * @module
 */

export { Iyzipay, type IyzipayOptions } from './client.js'
// Error classes for transport-level failures
export { IyzipayConnectionError, IyzipayError, IyzipayParseError, IyzipayTimeoutError } from './core/errors.js'
// Signature verification utilities
export {
	verifyCallbackSignature,
	verifyFormInitSignature,
	verifyFormRetrieveSignature,
	verifyPaymentSignature,
	verifyRefundSignature,
	verifyThreeDSAuthSignature,
	verifyThreeDSInitSignature,
} from './lib/signature.js'
// Webhook validation utilities
export { generateWebhookTestSignature, verifyWebhookSignature } from './lib/webhook.js'
// Type re-exports
export type * from './types/bin.js'
export type * from './types/cancel.js'
export type * from './types/card-storage.js'
export type * from './types/common/index.js'
export type * from './types/installment.js'
export type * from './types/iyzilink.js'
export type * from './types/marketplace.js'
export type * from './types/refund.js'
export type * from './types/reporting.js'
export type * from './types/subscription/index.js'
export type * from './types/webhook.js'
