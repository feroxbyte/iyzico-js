import type { SubscriptionBillingAddress, SubscriptionShippingAddress } from './common.js'

// ─── Request types ──────────────────────────────────────────────

/**
 * Request to update a subscription customer's information.
 *
 * @remarks
 * All fields are optional — only provided fields will be updated.
 * Does not extend `BaseRequest` because the iyzico customer API
 * does not accept `locale`/`conversationId` parameters.
 */
export interface SubscriptionCustomerUpdateRequest {
	/** Updated first name */
	name?: string
	/** Updated last name */
	surname?: string
	/** Updated national ID number */
	identityNumber?: string
	/** Updated email address */
	email?: string
	/** Updated GSM number */
	gsmNumber?: string
	/** Updated billing address */
	billingAddress?: SubscriptionBillingAddress
	/** Updated shipping address */
	shippingAddress?: SubscriptionShippingAddress
}

// ─── Query params ───────────────────────────────────────────────

/** Pagination parameters for listing subscription customers */
export interface SubscriptionCustomerListParams {
	[key: string]: unknown
	/** Page number to retrieve */
	page?: number
	/** Number of customers per page */
	count?: number
}

// ─── Response data ──────────────────────────────────────────────

/** Subscription customer (subscriber) data returned by the API */
export interface SubscriptionCustomerData {
	/** Unique reference code identifying this customer */
	referenceCode: string
	/** Customer creation date (epoch ms) */
	createdDate: number
	/** Customer status (e.g. ACTIVE) */
	status: string
	/** First name */
	name: string
	/** Last name */
	surname: string
	/** National ID number */
	identityNumber: string
	/** Primary email address (used for subscriber identity) */
	email: string
	/** Primary GSM number (used for subscriber identity) */
	gsmNumber: string
	/** Contact email address (for notifications) */
	contactEmail?: string
	/** Contact GSM number (for notifications) */
	contactGsmNumber?: string
	/** Billing address */
	billingAddress?: SubscriptionBillingAddress
	/** Shipping address */
	shippingAddress?: SubscriptionShippingAddress
}
