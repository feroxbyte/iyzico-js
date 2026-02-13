import type { BaseRequest } from '../common/api.js'
import type { PaymentInterval, PlanPaymentType, SubscriptionCurrency } from './common.js'

// ─── Request types ──────────────────────────────────────────────

/** Request to create a pricing plan for a product */
export interface PricingPlanCreateRequest extends BaseRequest {
	/** Plan name */
	name: string
	/** Amount to charge each billing period */
	price: number
	/** Currency code (TRY, USD, EUR). Foreign currency only allows non-TRY cards. */
	currencyCode: SubscriptionCurrency
	/** Billing interval (DAILY, WEEKLY, MONTHLY, YEARLY) */
	paymentInterval: PaymentInterval
	/** Subscription type (RECURRING) */
	planPaymentType: PlanPaymentType
	/** Frequency multiplier — e.g. `2` with WEEKLY = every 2 weeks */
	paymentIntervalCount?: number
	/** Total number of billing recurrences. Omit for indefinite (until canceled). @example 12 */
	recurrenceCount?: number
	/** Free trial period in days. First charge happens after this period. */
	trialPeriodDays?: number
}

/** Request to update a pricing plan. Only `name` and `trialPeriodDays` can be changed. */
export interface PricingPlanUpdateRequest extends BaseRequest {
	/** Updated plan name */
	name: string
	/** Updated trial period in days */
	trialPeriodDays?: number
}

// ─── Query params ───────────────────────────────────────────────

/** Pagination parameters for listing pricing plans */
export interface PricingPlanListParams {
	[key: string]: unknown
	/** Page number to retrieve */
	page?: number
	/** Number of plans per page */
	count?: number
}

// ─── Response data ──────────────────────────────────────────────

/** Pricing plan data returned by the API */
export interface PricingPlanData {
	/** Unique reference code of the plan */
	referenceCode: string
	/** Plan creation time (epoch ms) */
	createdDate: number
	/** Plan name */
	name: string
	/** Reference code of the parent product */
	productReferenceCode: string
	/** Amount charged per billing period */
	price: number
	/** Currency code */
	currencyCode: SubscriptionCurrency
	/** Billing interval */
	paymentInterval: PaymentInterval
	/** Frequency multiplier for the interval */
	paymentIntervalCount: number
	/** Subscription type (RECURRING) */
	planPaymentType: PlanPaymentType
	/** Total number of billing recurrences */
	recurrenceCount: number
	/** Free trial period in days */
	trialPeriodDays: number
	/** Plan status (e.g. ACTIVE) */
	status: string
}
