import type { BaseRequest } from '../common/api.js'
import type { Currency, PaymentGroup } from '../common/enum.js'
import type { Address, BasketItem, Buyer } from '../common/sub-objects.js'
import type { PaymentCreateResponse } from './payment.js'

// ─── Request types ───────────────────────────────────────────────

/** Checkout Form initialize request — same as payment create but without `paymentCard`, with `callbackUrl` and `enabledInstallments` */
export interface CheckoutFormInitializeRequest extends BaseRequest {
	/** Total basket price (decimal string) */
	price: string
	/** Amount to charge (decimal string) */
	paidPrice: string
	/** Payment currency @default 'TRY' */
	currency: Currency
	/** Payment group @default 'PRODUCT' */
	paymentGroup?: PaymentGroup
	/** Merchant-assigned basket ID */
	basketId?: string
	/** URL to redirect after checkout completes (must have a valid SSL certificate) */
	callbackUrl: string
	/** Allowed installment options (e.g. `[1, 2, 3, 6, 9, 12]`) */
	enabledInstallments?: number[]
	/** Buyer information */
	buyer: Buyer
	/** Shipping address */
	shippingAddress: Address
	/** Billing address */
	billingAddress: Address
	/** Basket items */
	basketItems: BasketItem[]
	/** Payment source (for partner integrations) */
	paymentSource?: string
}

/** Checkout Form preAuth initialize request — same shape as CF initialize */
export type CheckoutFormPreAuthInitializeRequest = CheckoutFormInitializeRequest

/** Checkout Form retrieve request — uses the `token` from the initialize response */
export interface CheckoutFormRetrieveRequest extends BaseRequest {
	/** Token returned from the checkout form initialize call */
	token: string
}

// ─── Response types ──────────────────────────────────────────────

/** Checkout Form initialize response */
export interface CheckoutFormInitializeResponse {
	/** Unique token for this checkout form session — must be stored to retrieve the payment result */
	token: string
	/** Base64-encoded HTML content for embedding the checkout form */
	checkoutFormContent: string
	/** URL to iyzico's hosted payment page (alternative to embedding) */
	paymentPageUrl: string
	/** URL to iyzico's "Pay with iyzico" hosted page */
	payWithIyzicoPageUrl: string
	/** Token validity period in seconds */
	tokenExpireTime: number
	/** Response signature for verification */
	signature: string
}

/** Checkout Form preAuth initialize response — same shape as CF initialize */
export type CheckoutFormPreAuthInitializeResponse = CheckoutFormInitializeResponse

/** Checkout Form retrieve response — payment result after the form is completed */
export interface CheckoutFormRetrieveResponse extends PaymentCreateResponse {
	/** Token echoed from the checkout form session */
	token: string
	/** Callback URL echoed from the initialize request */
	callbackUrl: string
	/** Payment result status */
	paymentStatus: string
}
