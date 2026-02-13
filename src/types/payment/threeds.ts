import type { BaseRequest } from '../common/api.js'
import type { Currency } from '../common/enum.js'
import type { PaymentCreateRequest, PaymentCreateResponse } from './payment.js'

// ─── Request types ───────────────────────────────────────────────

/** 3DS initialize request — same as payment create but requires `callbackUrl` */
export interface ThreeDSInitializeRequest extends PaymentCreateRequest {
	/** URL to redirect after 3DS verification completes (must have a valid SSL certificate) */
	callbackUrl: string
}

/** 3DS preAuth initialize request — same shape as 3DS initialize */
export type ThreeDSPreAuthInitializeRequest = ThreeDSInitializeRequest

/** 3DS v1 auth (complete) request — just needs the paymentId from initialize */
export interface ThreeDSAuthRequest extends BaseRequest {
	/** Payment ID returned from the 3DS initialize call */
	paymentId: string
	/** Data posted back from the 3DS callback. Must be sent if it was returned non-empty. */
	conversationData?: string
}

/** 3DS v2 auth (complete) request — requires additional fields for verification */
export interface ThreeDSAuthV2Request extends BaseRequest {
	/** Payment ID returned from the 3DS initialize call */
	paymentId: string
	/** Amount to charge — must match the `paidPrice` sent in the initialize step */
	paidPrice: string
	/** Basket ID — must match the `basketId` sent in the initialize step */
	basketId: string
	/** Currency — must match the `currency` sent in the initialize step */
	currency: Currency
}

// ─── Response types ──────────────────────────────────────────────

/** 3DS initialize response — returns HTML content for the 3DS verification screen */
export interface ThreeDSInitializeResponse {
	/** Base64-encoded HTML content for the 3DS verification screen */
	threeDSHtmlContent: string
	/** Payment ID to use in the subsequent auth call */
	paymentId: string
	/** Response signature for verification */
	signature: string
}

export type ThreeDSPreAuthInitializeResponse = ThreeDSInitializeResponse

/** 3DS auth response — same as payment response plus `mdStatus` */
export interface ThreeDSAuthResponse extends PaymentCreateResponse {
	/**
	 * 3DS verification result.
	 * - `1`: Successful
	 * - `0`: 3D Secure signature invalid or verification failed
	 * - `-1`: Same as 0 (QNB Finansbank specific)
	 * - `2`: Card holder or bank not enrolled in the system
	 * - `3`: Card's bank not enrolled in the system
	 * - `4`: Verification attempt — card holder chose to enroll later
	 * - `5`: Verification could not be performed
	 * - `6`: 3D Secure error
	 * - `7`: System error
	 * - `8`: Unknown card number
	 */
	mdStatus: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
}

export type ThreeDSAuthV2Response = ThreeDSAuthResponse
