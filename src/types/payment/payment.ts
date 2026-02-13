import type { BaseRequest } from '../common/api.js'
import type { CardAssociation, CardFamily, CardType, Currency, PaymentChannel, PaymentGroup } from '../common/enum.js'
import type { Address, BasketItem, Buyer, PaymentCard, PaymentCardSaved } from '../common/sub-objects.js'
import type { ItemTransaction } from '../common/transaction.js'

// Re-export sub-object types so existing consumers can still import from here
export type { Address, BasketItem, Buyer, PaymentCard, PaymentCardSaved }

// ─── Request types ───────────────────────────────────────────────

/** Request to create a new payment (auth or pre-auth) */
export interface PaymentCreateRequest extends BaseRequest {
	/** Amount to charge the card (includes commission, decimal string) */
	paidPrice: string
	/** Total basket price (decimal string, e.g. `'1.0'`) */
	price: string
	/**
	 * Payment group for categorizing payments (used in reporting and settlement)
	 * @default 'PRODUCT'
	 */
	paymentGroup?: PaymentGroup
	/**
	 * Payment currency
	 * @default 'TRY'
	 */
	currency: Currency
	/** Number of installments (if omitted, single payment (1) is applied.) */
	installment?: 1 | 2 | 3 | 4 | 6 | 9 | 12
	/** Merchant-assigned basket ID */
	basketId?: string
	/** Channel through which the payment is initiated */
	paymentChannel?: PaymentChannel
	/** Card information — raw card details (`PaymentCard`) or stored card reference (`PaymentCardSaved` with `cardUserKey` + `cardToken`) */
	paymentCard: PaymentCard | PaymentCardSaved
	/** Buyer (customer) information */
	buyer: Buyer
	/** Shipping address. Required if at least one of the basket items has itemType "PHYSICAL". Not required if all items are "VIRTUAL". */
	shippingAddress?: Address
	/** Billing address */
	billingAddress: Address
	/** Items in the basket */
	basketItems: BasketItem[]
	/** Payment source. Sent by partner companies with iyzico integration. @example "Shopify" */
	paymentSource?: string
}

/** Request to retrieve payment details. */
export interface PaymentRetrieveRequest extends BaseRequest {
	/** Payment transaction ID */
	paymentId: string
	/** ConversationId of the payment transaction. Required if paymentId is not sent. */
	paymentConversationId?: string
}

export type PaymentPreAuthCreateRequest = PaymentCreateRequest

/** Request to capture (post-authorize) a pre-authorized payment */
export interface PaymentPostAuthCreateRequest extends BaseRequest {
	/** Payment ID returned from the pre-authorization @example "24534657" */
	paymentId: string
	/** Final amount to charge from card @example "1" */
	paidPrice: string
	/** IP address of the client sending the request @example "85.34.78.112" */
	ip?: string
	/** Currency @example "TRY" */
	currency?: string
}

// ─── Response types ──────────────────────────────────────────────

/** Non-3DS payment create/preAuth/postAuth success response */
export interface PaymentCreateResponse {
	/** Total basket price */
	price: number
	/** Total amount charged to the card */
	paidPrice: number
	/** Number of installments applied */
	installment: number
	/** Unique payment ID — must be stored for refund, cancel, and inquiry operations */
	paymentId: string
	/**
	 * Fraud filter result. Only ship the product when value is `1`.
	 * For `0`, wait for async notification before taking action.
	 * - `1`: Approved
	 * - `0`: Under review
	 * - `-1`: Declined
	 */
	fraudStatus: 1 | 0 | -1
	/** Merchant commission rate applied (informational, e.g. 10 means 10%) */
	merchantCommissionRate: number
	/** Merchant commission amount (informational) */
	merchantCommissionRateAmount: number
	/** iyzico transaction commission amount */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee */
	iyziCommissionFee: number
	/** Card type (`CREDIT_CARD`, `DEBIT_CARD`, `PREPAID_CARD`) — absent for some cross-border cards */
	cardType?: CardType
	/** Card association / scheme (`VISA`, `MASTER_CARD`, `AMERICAN_EXPRESS`, `TROY`) — absent for some cross-border cards */
	cardAssociation?: CardAssociation
	/** Card family/program name — absent for some cross-border cards */
	cardFamily?: CardFamily
	/** BIN number (first 6 digits of the card) */
	binNumber: string
	/** Last 4 digits of the card */
	lastFourDigits: string
	/** Merchant-assigned basket ID echoed from the request */
	basketId?: string
	/** Payment currency. */
	currency: Currency
	/** Per-item transaction breakdowns */
	itemTransactions: ItemTransaction[]
	/** Bank authorization code */
	authCode: string
	/** Payment phase (e.g. `AUTH`, `PRE_AUTH`, `POST_AUTH`) */
	phase: string
	/** Bank host reference number */
	hostReference: string
	/** Response signature for verification */
	signature: string
}

export type PaymentPreAuthCreateResponse = PaymentCreateResponse
export type PaymentPostAuthCreateResponse = PaymentCreateResponse

/** Payment retrieve success response — extends create response with `paymentStatus` */
export interface PaymentRetrieveResponse extends PaymentCreateResponse {
	/**
	 * Payment lifecycle status.
	 * - `SUCCESS`: Payment completed successfully
	 * - `FAILURE`: Payment failed
	 * - `INIT_THREEDS`: 3DS initialization phase
	 * - `CALLBACK_THREEDS`: 3DS callback phase
	 */
	paymentStatus: 'SUCCESS' | 'FAILURE' | 'INIT_THREEDS' | 'CALLBACK_THREEDS'
}
