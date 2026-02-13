// Re-export V2 response wrappers for backwards compatibility
export type {
	ResponseBaseV2 as SubscriptionBaseResponse,
	ResponseDataV2 as SubscriptionDataResponse,
	ResponseErrorV2 as SubscriptionErrorResponse,
	ResponsePaginatedDataV2 as SubscriptionPaginatedData,
	ResponsePaginatedV2 as SubscriptionPaginatedResponse,
	ResponseV2 as SubscriptionResponse,
} from '../common/v2.js'

// ─── Enums ──────────────────────────────────────────────────────

/** Subscription lifecycle status */
export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'UNPAID' | 'UPGRADED' | 'CANCELED' | 'EXPIRED'

/** Initial status when creating a subscription. `PENDING` delays activation until explicitly activated. */
export type SubscriptionInitialStatus = 'ACTIVE' | 'PENDING'

/** Billing interval for a pricing plan */
export type PaymentInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

/** Subscription payment type */
export type PlanPaymentType = 'RECURRING'

/** When a plan upgrade takes effect */
export type UpgradePeriod = 'NOW' | 'NEXT_PERIOD'

/** Status of a subscription billing period (order) */
export type OrderStatus = 'WAITING' | 'SUCCESS' | 'FAILED'

/** Result of a single payment attempt within a subscription period */
export type SubscriptionPaymentStatus = 'SUCCESS' | 'FAILED'

/** Currencies supported by the subscription API */
export type SubscriptionCurrency = 'TRY' | 'USD' | 'EUR'

// ─── Sub-objects ────────────────────────────────────────────────

/** Customer information for subscription initialization */
export interface SubscriptionCustomer {
	/** First name @example "John" */
	name: string
	/** Last name @example "Doe" */
	surname: string
	/** Email address @example "john@example.com" */
	email: string
	/** GSM number, prefer E.164 format @example "+905555555555" */
	gsmNumber: string
	/** National ID number @example "74300864791" */
	identityNumber: string
	/** Billing address (required) */
	billingAddress: SubscriptionBillingAddress
	/** Shipping address (optional) */
	shippingAddress?: SubscriptionShippingAddress
}

/** Billing address for a subscription customer */
export interface SubscriptionBillingAddress {
	/** Full address line */
	address: string
	/** ZIP/Postal code */
	zipCode?: string
	/** Contact person name */
	contactName: string
	/** City */
	city: string
	/** District (ilçe) within the city */
	district?: string
	/** Country */
	country: string
}

/** Shipping address for a subscription customer */
export interface SubscriptionShippingAddress {
	/** Full address line */
	address?: string
	/** ZIP/Postal code */
	zipCode?: string
	/** Contact person name */
	contactName?: string
	/** City */
	city?: string
	/** District (ilçe) within the city */
	district?: string
	/** Country */
	country?: string
}

// ─── Shared response sub-objects ────────────────────────────────

/** Brief pricing plan data returned within product responses */
export interface PricingPlanSummary {
	/** Unique reference code of the plan */
	referenceCode: string
	/** Plan creation date (`YYYY-MM-DD hh:mm:ss`) */
	createdDate: string
	/** Plan name */
	name: string
	/** Amount charged per billing period */
	price: number
	/** Billing interval (DAILY, WEEKLY, MONTHLY, YEARLY) */
	paymentInterval: PaymentInterval
	/** Frequency multiplier for the interval (e.g. 2 = every 2 weeks) */
	paymentIntervalCount: number
	/** Free trial period in days */
	trialPeriodDays: number
	/** Currency code */
	currencyCode: SubscriptionCurrency
	/** Reference code of the parent product */
	productReferenceCode: string
	/** Plan payment type (RECURRING) */
	planPaymentType: PlanPaymentType
	/** Plan status (e.g. ACTIVE) */
	status: string
	/** Total number of billing recurrences (0 = until canceled) */
	recurrenceCount: number
}

/** A billing period (order) within a subscription */
export interface SubscriptionOrder {
	/** Reference code of this period */
	referenceCode: string
	/** Period price */
	price: number
	/** Currency code */
	currencyCode: SubscriptionCurrency
	/** Start time of the period (epoch ms) */
	startPeriod: number
	/** End time of the period (epoch ms) */
	endPeriod: number
	/** Period status (WAITING, SUCCESS, FAILED) */
	orderStatus: OrderStatus
	/** Payment attempts made for this period */
	paymentAttempts: SubscriptionPaymentAttempt[]
}

/** A single payment attempt for a subscription billing period */
export interface SubscriptionPaymentAttempt {
	/** Request/response correlation ID */
	conversationId?: string
	/** Attempt creation time (epoch ms) */
	createdDate: number
	/** Result of the payment attempt */
	paymentStatus: SubscriptionPaymentStatus
	/** Payment ID — present only on SUCCESS */
	paymentId?: number
	/** Error code — present only on FAILED */
	errorCode?: string
	/** Error message — present only on FAILED */
	errorMessage?: string
}
