import type { BaseRequest } from '../common/api.js'
import type { PaymentCard } from '../common/sub-objects.js'
import type {
	SubscriptionCustomer,
	SubscriptionInitialStatus,
	SubscriptionOrder,
	SubscriptionStatus,
	UpgradePeriod,
} from './common.js'

// ─── Initialize (NON-3DS, new customer) ─────────────────────────

/** Request to start a subscription via direct API (NON-3DS) with a new customer */
export interface SubscriptionInitializeRequest extends BaseRequest {
	/** Reference code of the pricing plan to subscribe to */
	pricingPlanReferenceCode: string
	/** Initial subscription status. `PENDING` defers activation. */
	subscriptionInitialStatus: SubscriptionInitialStatus
	/** Customer (buyer) information */
	customer: SubscriptionCustomer
	/** Credit card details for the subscription */
	paymentCard: PaymentCard
}

// ─── Initialize (existing customer) ─────────────────────────────

/** Request to start a subscription for an existing customer (must already have an active subscription) */
export interface SubscriptionInitializeWithCustomerRequest extends BaseRequest {
	/** Reference code of the pricing plan to subscribe to */
	pricingPlanReferenceCode: string
	/** Initial subscription status. `PENDING` defers activation. */
	subscriptionInitialStatus: SubscriptionInitialStatus
	/** Reference code of the existing customer */
	customerReferenceCode: string
}

// ─── Initialize (Checkout Form) ─────────────────────────────────

/** Request to start a subscription via iyzico Checkout Form */
export interface SubscriptionCheckoutFormInitializeRequest extends BaseRequest {
	/** Callback URL where the payment result will be posted */
	callbackUrl: string
	/** Reference code of the pricing plan to subscribe to */
	pricingPlanReferenceCode: string
	/** Initial subscription status. `PENDING` defers activation. */
	subscriptionInitialStatus: SubscriptionInitialStatus
	/** Customer (buyer) information */
	customer: SubscriptionCustomer
}

// ─── Operations ─────────────────────────────────────────────────

/** Request to upgrade/change a subscription's pricing plan */
export interface SubscriptionUpgradeRequest extends BaseRequest {
	/** Reference code of the target pricing plan */
	newPricingPlanReferenceCode: string
	/** When the upgrade takes effect — `NOW` or `NEXT_PERIOD` */
	upgradePeriod: UpgradePeriod
	/** If `true`, includes the trial period of the new plan */
	useTrial?: boolean
	/** If `true`, recalculates end date from the new plan's recurrenceCount */
	resetRecurrenceCount?: boolean
}

/** Request to retry a failed subscription payment */
export interface SubscriptionRetryRequest extends BaseRequest {
	/** Reference code of the failed payment (orderReferenceCode from the webhook) */
	referenceCode: string
}

/** Request to initialize a card update via Checkout Form */
export interface SubscriptionCardUpdateRequest extends BaseRequest {
	/** Callback URL where the update result will be posted */
	callbackUrl: string
	/** Reference code of the customer whose card will be updated */
	customerReferenceCode: string
	/** If updating a specific subscription's card (optional) */
	subscriptionReferenceCode?: string
}

// ─── Search params ──────────────────────────────────────────────

/** Query parameters for searching/filtering subscriptions */
export interface SubscriptionSearchParams {
	[key: string]: unknown
	/** Filter by subscription reference code */
	subscriptionReferenceCode?: string
	/** Filter by customer reference code */
	customerReferenceCode?: string
	/** Filter by pricing plan reference code */
	pricingPlanReferenceCode?: string
	/** Filter by parent reference code */
	parentReferenceCode?: string
	/** Filter by subscription status */
	subscriptionStatus?: SubscriptionStatus
	/** Filter by start date (epoch ms) */
	startDate?: number
	/** Filter by end date (epoch ms) */
	endDate?: number
	/** Page number to retrieve */
	page?: number
	/** Number of records per page */
	count?: number
}

// ─── Response data shapes ───────────────────────────────────────

/** Response data from subscription initialize (NON-3DS and with-customer) */
export interface SubscriptionInitializeData {
	/** Reference code of the created subscription */
	referenceCode: string
	/** Parent reference code for correlating subscription updates */
	parentReferenceCode: string
	/** Reference code of the linked pricing plan */
	pricingPlanReferenceCode: string
	/** Reference code of the customer (derived from email + GSM) */
	customerReferenceCode: string
	/** Current subscription status */
	subscriptionStatus: SubscriptionInitialStatus
	/** Trial period in days (from the plan) */
	trialDays: number
	/** Trial start time (epoch ms) — always present, 0 when no trial */
	trialStartDate: number
	/** Trial end time (epoch ms) — always present, 0 when no trial */
	trialEndDate: number
	/** Subscription creation time (epoch ms) */
	createdDate: number
	/** Subscription start time (epoch ms) */
	startDate: number
	/** Subscription end time (epoch ms) */
	endDate: number
}

/** Response data from Checkout Form initialization */
export interface SubscriptionCheckoutFormData {
	/** Token for the checkout form session */
	token: string
	/** HTML content of the checkout form */
	checkoutFormContent: string
	/** Token validity period in seconds */
	tokenExpireTime: number
}

/** Response data from subscription upgrade */
export interface SubscriptionUpgradeData {
	/** Reference code of the new subscription */
	referenceCode: string
	/** Parent reference code for correlating updates */
	parentReferenceCode: string
	/** Reference code of the new pricing plan */
	pricingPlanReferenceCode: string
	/** Customer reference code */
	customerReferenceCode: string
	/** Subscription status after upgrade */
	subscriptionStatus: SubscriptionStatus
	/** Trial period in days */
	trialDays: number
	/** Creation time (epoch ms) */
	createdDate: number
	/** Start time (epoch ms) */
	startDate: number
	/** End time (epoch ms) */
	endDate: number
}

/** Detailed subscription record returned by retrieve/search */
export interface SubscriptionDetailItem {
	/** Subscription reference code */
	referenceCode: string
	/** Parent reference code for correlating updates */
	parentReferenceCode: string
	/** Name of the linked pricing plan */
	pricingPlanName: string
	/** Reference code of the linked pricing plan */
	pricingPlanReferenceCode: string
	/** Product name */
	productName: string
	/** Product reference code */
	productReferenceCode: string
	/** Customer email address */
	customerEmail: string
	/** Customer GSM number */
	customerGsmNumber: string
	/** Customer reference code */
	customerReferenceCode: string
	/** Subscription lifecycle status */
	subscriptionStatus: SubscriptionStatus
	/** Trial period in days */
	trialDays: number
	/** Trial start time (epoch ms) — always present, 0 when no trial */
	trialStartDate: number
	/** Trial end time (epoch ms) — always present, 0 when no trial */
	trialEndDate: number
	/** Subscription creation time (epoch ms) */
	createdDate: number
	/** Subscription start time (epoch ms) */
	startDate: number
	/** Subscription end time (epoch ms) */
	endDate: number
	/** Billing periods (orders) within this subscription */
	orders: SubscriptionOrder[]
}

/** Response data from card update Checkout Form initialization */
export interface SubscriptionCardUpdateData {
	/** Token for the card update checkout form session */
	token: string
	/** HTML content of the card update checkout form */
	checkoutFormContent: string
	/** Token validity period in seconds */
	tokenExpireTime: number
}
