import type { BaseRequest } from './common/api.js'

// ─── Request types ───────────────────────────────────────────────

/** Request to cancel a payment */
export interface CancelCreateRequest extends BaseRequest {
	/** Payment ID to cancel */
	paymentId: string
	/** IP address the request is sent from */
	ip?: string
}

// ─── Response types ──────────────────────────────────────────────

/** Cancel success response */
export interface CancelResponse {
	/** Canceled payment ID */
	paymentId: string
	/** Canceled payment amount */
	price: number
	/** Currency */
	currency: string
	/** Authorization code returned by the bank */
	authCode: string
	/** Host reference value from the bank */
	hostReference: string
	/** Reference value for the cancel transaction */
	cancelHostReference: string
}
