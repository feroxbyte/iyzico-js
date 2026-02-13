import type { BaseRequest } from '../common/api.js'
import type { Currency, PaymentChannel, PaymentGroup } from '../common/enum.js'
import type { Address, BasketItem, Buyer } from '../common/sub-objects.js'
import type { PaymentCreateResponse } from './payment.js'

// ─── Request types ───────────────────────────────────────────────

/** Pay with iyzico (PWI) initialize request */
export interface PayWithIyzicoInitializeRequest extends BaseRequest {
	/** Total basket price (decimal string) */
	price: string
	/** Amount to charge (decimal string) */
	paidPrice: string
	/** Payment currency @default 'TRY' */
	currency: Currency
	/** Payment group @default 'PRODUCT' */
	paymentGroup?: PaymentGroup
	/** Merchant-assigned basket ID */
	basketId: string
	/** URL to redirect after payment completes (must have a valid SSL certificate) */
	callbackUrl: string
	/** Channel through which the payment is initiated */
	paymentChannel?: PaymentChannel
	/** Allowed installment options (e.g. `[1, 2, 3, 6, 9, 12]`) */
	enabledInstallments?: number[]
	/** Buyer information (note: `ip` is required for PWI unlike standard payments) */
	buyer: Buyer & { ip: string }
	/** Shipping address */
	shippingAddress: Address
	/** Billing address */
	billingAddress: Address
	/** Basket items */
	basketItems: BasketItem[]
	/** Payment source (for partner integrations) */
	paymentSource?: string
}

/** Pay with iyzico (PWI) retrieve request — uses the `token` from the initialize response */
export interface PayWithIyzicoRetrieveRequest extends BaseRequest {
	/** Token returned from the PWI initialize call */
	token: string
}

// ─── Response types ──────────────────────────────────────────────

/** Pay with iyzico (PWI) initialize response */
export interface PayWithIyzicoInitializeResponse {
	/** Unique token for this PWI session — must be stored to retrieve the payment result */
	token: string
	/** Token validity duration in seconds (typically 1800 = 30 min) */
	tokenExpireTime: number
	/** URL to redirect the customer to iyzico's payment page */
	payWithIyzicoPageUrl: string
	/** Response signature for verification */
	signature: string
}

/** Pay with iyzico (PWI) retrieve response — payment result after the customer completes payment */
export interface PayWithIyzicoRetrieveResponse extends PaymentCreateResponse {
	/** Token echoed from the PWI session */
	token: string
	/** Callback URL echoed from the initialize request */
	callbackUrl: string
	/** Payment result status */
	paymentStatus: string
	/** Email address of the iyzico member who completed the payment */
	memberEmail: string
	/** GSM number of the iyzico member who completed the payment */
	memberGsmNumber: string
}
