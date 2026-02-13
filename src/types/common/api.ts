import type { Locale } from './enum.js'

export interface BaseResponse {
	/** `'success'` or `'failure'` */
	status: 'success' | 'failure'
	/** Response locale */
	locale: Locale
	/** Server timestamp in unix milliseconds */
	systemTime: number
	/** Echoed conversation ID for request correlation */
	conversationId?: string
}

export interface ErrorResponse extends BaseResponse {
	status: 'failure'
	/** iyzico error code */
	errorCode: string
	/** Human-readable error description */
	errorMessage: string
	/** Error category grouping (e.g. `NOT_SUFFICIENT_FUNDS`) — not always present in the response */
	errorGroup?: string
}

export interface SuccessResponse extends BaseResponse {
	status: 'success'
}

/** Discriminated union: success returns `T & SuccessResponse`, failure returns `ErrorResponse` */
export type ApiResponse<T> = (T & SuccessResponse) | ErrorResponse

/** Fields common to all API requests */
export interface BaseRequest {
	/** @default 'tr' */
	locale?: Locale
	/** Merchant-side conversation ID for request correlation */
	conversationId?: string
}
