import type { Locale } from './enum.js'

// ─── V2 Generic Response Wrappers ──────────────────────────────
// Shared across all V2 endpoints (subscription, iyzilink, etc.)

/** Base response shape for V2 API endpoints */
export interface ResponseBaseV2 {
	/** `'success'` or `'failure'` */
	status: 'success' | 'failure'
	/** Server timestamp in unix milliseconds */
	systemTime: number
	/** Response locale */
	locale?: Locale
	/** Echoed conversation ID for request correlation */
	conversationId?: string
}

/** Error response from V2 API endpoints */
export interface ResponseErrorV2 extends ResponseBaseV2 {
	status: 'failure'
	/** iyzico error code */
	errorCode: string
	/** Human-readable error description */
	errorMessage: string
}

/** Success response wrapping entity data in a `data` envelope */
export interface ResponseDataV2<T> extends ResponseBaseV2 {
	status: 'success'
	/** Response payload */
	data: T
}

/** Discriminated union: success wraps `T` in `data`, failure returns error fields */
export type ResponseV2<T> = ResponseDataV2<T> | ResponseErrorV2

/** Paginated data envelope used by V2 list/search endpoints */
export interface ResponsePaginatedDataV2<T> {
	/** Total number of records matching the query */
	totalCount: number
	/** Current page number */
	currentPage: number
	/** Total number of pages */
	pageCount: number
	/** Records on this page */
	items: T[]
}

/** Discriminated union for paginated V2 list endpoints */
export type ResponsePaginatedV2<T> = ResponseDataV2<ResponsePaginatedDataV2<T>> | ResponseErrorV2
