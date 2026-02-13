import type { BaseRequest } from './common/api.js'
import type { Currency } from './common/enum.js'

// ─── Request types ───────────────────────────────────────────────

/** Request to refund a specific basket item by paymentTransactionId (V1) */
export interface RefundCreateRequest extends BaseRequest {
	/** Payment transaction ID (basket item) to refund */
	paymentTransactionId: string
	/** Amount to refund — must not exceed the item price */
	price: string
	/** IP address the request is sent from */
	ip?: string
	/** Payment currency */
	currency?: Currency
}

/** Request to refund by paymentId (amount-based, V2) — no item breakdown required */
export interface RefundAmountBasedCreateRequest extends BaseRequest {
	/** Payment ID to refund */
	paymentId: string
	/** Amount to refund — must not exceed the payment total */
	price: string
	/** IP address the request is sent from */
	ip?: string
	/** Payment currency */
	currency?: Currency
}

// ─── Response types ──────────────────────────────────────────────

/** Refund success response (V1 — per item) */
export interface RefundResponse {
	/** Payment ID */
	paymentId: string
	/** Refunded payment transaction ID */
	paymentTransactionId: string
	/** Refunded amount */
	price: number
	/** Currency */
	currency: string
	/** Authorization code returned by the bank */
	authCode: string
	/** Host reference value from the bank */
	hostReference: string
	/** Reference value for the refund transaction */
	refundHostReference: string
	/** Whether the refund can be retried if it fails */
	retryable: boolean
	/** Response signature for verification */
	signature: string
}

/** Refund success response (V2 — amount-based) */
export interface RefundAmountBasedResponse {
	/** Refunded payment ID */
	paymentId: string
	/** Refunded amount */
	price: number
	/** Currency */
	currency: string
	/** Authorization code returned by the bank */
	authCode: string
	/** Host reference value from the bank */
	hostReference: string
	/** Reference value for the refund transaction */
	refundHostReference: string
	/** Response signature for verification */
	signature: string
}
