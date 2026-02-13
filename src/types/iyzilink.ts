import type { BaseRequest } from './common/api.js'
import type { Currency, Locale } from './common/enum.js'

// ─── Enums / Type Unions ────────────────────────────────────────

/** iyzilink product type */
export type IyzilinkProductType = 'IYZILINK' | 'FASTLINK'

/** iyzilink product status */
export type IyzilinkProductStatus = 'ACTIVE' | 'PASSIVE'

/** iyzilink product category */
export type IyzilinkCategoryType = 'GOLD' | 'FOOD' | 'PHONE' | 'UNKNOWN' | 'PC' | 'TABLET'

// ─── Request interfaces ─────────────────────────────────────────

/** Request body for creating a standard iyzilink product */
export interface IyzilinkCreateRequest extends BaseRequest {
	/** Product name */
	name: string
	/** Product description */
	description: string
	/** Price (string with decimal, e.g. "100.0") */
	price: string
	/** Currency code */
	currencyCode: Currency
	/** Base64-encoded product image */
	encodedImageFile: string
	/** Whether to ignore address requirement */
	addressIgnorable?: boolean
	/** Number of units in stock (requires `stockEnabled: true`) */
	stockCount?: number
	/** Whether to enable stock management */
	stockEnabled?: boolean
	/** Whether to request installment payments */
	installmentRequested?: boolean
}

/** Request body for creating a fastlink product */
export interface IyzilinkFastLinkCreateRequest {
	/** Price (string with decimal, e.g. "100.0") */
	price: string
	/** Currency code */
	currencyCode: Currency
	/** Response locale */
	locale?: Locale
	/** Merchant-side conversation ID for request correlation */
	conversationId?: string
	/** Product description */
	description?: string
}

/** Request body for updating an iyzilink product */
export interface IyzilinkUpdateRequest extends BaseRequest {
	/** Product name */
	name: string
	/** Product description */
	description: string
	/** Price (string with decimal, e.g. "100.0") */
	price: string
	/** Currency code */
	currencyCode: Currency
	/** Base64-encoded product image */
	encodedImageFile?: string
	/** Whether to ignore address requirement */
	addressIgnorable?: boolean
	/** Number of units in stock */
	stockCount?: number
	/** Whether to enable stock management */
	stockEnabled?: boolean
	/** Whether to request installment payments */
	installmentRequested?: boolean
}

// ─── Query param interfaces ─────────────────────────────────────

/** Pagination params for listing iyzilink products */
export interface IyzilinkListParams {
	[key: string]: unknown
	/** Response locale */
	locale?: Locale
	/** Merchant-side conversation ID */
	conversationId?: string
	/** Page number (1-based) */
	page?: number
	/** Items per page */
	count?: number
}

/** Query params shared by retrieve, status update, and delete */
export interface IyzilinkQueryParams {
	[key: string]: unknown
	/** Response locale */
	locale?: Locale
	/** Merchant-side conversation ID */
	conversationId?: string
}

// ─── Response data shapes ───────────────────────────────────────

/** Data returned when creating or updating an iyzilink product */
export interface IyzilinkCreateOrUpdateData {
	/** Unique product token */
	token: string
	/** Payment link URL */
	url: string
	/** Product image URL */
	imageUrl: string
}

/** Full iyzilink product detail */
export interface IyzilinkProduct {
	/** Product name */
	name: string
	/** Product description */
	description: string
	/** Product price */
	price: number
	/** Currency code */
	currencyCode: Currency
	/** Currency numeric ID */
	currencyId: number
	/** Unique product token */
	token: string
	/** Product type (IYZILINK or FASTLINK) */
	productType: IyzilinkProductType
	/** Product status (ACTIVE or PASSIVE) */
	productStatus: IyzilinkProductStatus
	/** Merchant ID */
	merchantId: number
	/** Payment link URL */
	url: string
	/** Product image URL */
	imageUrl: string
	/** Whether address requirement is ignored */
	addressIgnorable: boolean
	/** Number of times sold */
	soldCount: number
	/** Whether installment payments are requested */
	installmentRequested: boolean
	/** Whether stock management is enabled */
	stockEnabled: boolean
	/** Number of units in stock */
	stockCount: number
	/** Preset price values */
	presetPriceValues: number[]
	/** Whether the link is flexible */
	flexibleLink: boolean
	/** Product category type */
	categoryType: IyzilinkCategoryType
	/** Whether corporate sales are enabled */
	corporateSaleEnabled: boolean
	/** Whether quantity-based sales are enabled */
	quantitySaleEnabled: boolean
	/** Echoed conversation ID */
	conversationId?: string
}

/** Paginated list data for iyzilink products */
export interface IyzilinkListData {
	/** Whether listing has been reviewed */
	listingReviewed: boolean
	/** Total number of products */
	totalCount: number
	/** Current page number */
	currentPage: number
	/** Total number of pages */
	pageCount: number
	/** Products on this page */
	items: IyzilinkProduct[]
}
