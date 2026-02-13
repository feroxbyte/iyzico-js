import type { BaseRequest } from '../common/api.js'
import type { PricingPlanSummary } from './common.js'

// ─── Request types ──────────────────────────────────────────────

/** Request to create a subscription product */
export interface SubscriptionProductCreateRequest extends BaseRequest {
	/** Product name */
	name: string
	/** Product description */
	description?: string
}

/** Request to update a subscription product */
export interface SubscriptionProductUpdateRequest extends BaseRequest {
	/** New product name */
	name: string
	/** New product description */
	description?: string
}

// ─── Query params (not BaseRequest — used for GET query strings) ─

/** Pagination parameters for listing subscription products */
export interface SubscriptionProductListParams {
	[key: string]: unknown
	/** Page number to retrieve */
	page?: number
	/** Number of products per page */
	count?: number
}

// ─── Response data ──────────────────────────────────────────────

/** Subscription product data returned by the API */
export interface SubscriptionProductData {
	/** Unique reference code of the product */
	referenceCode: string
	/** Product creation date (`YYYY-MM-DD hh:mm:ss`) */
	createdDate: string
	/** Product name */
	name: string
	/** Product description */
	description?: string
	/** Product status (e.g. ACTIVE) */
	status: string
	/** Pricing plans linked to this product */
	pricingPlans: PricingPlanSummary[]
}
