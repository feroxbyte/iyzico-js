import type { BaseRequest } from './common/api.js'
import type { CardAssociation, CardFamily, CardType, Currency } from './common/enum.js'

// ─── Type Unions ────────────────────────────────────────────

/** Payment status in reporting responses */
export type ReportingPaymentStatus = 1 | 2 | 3

/** Refund status string in reporting payment details */
export type ReportingRefundStatus = 'NOT_REFUNDED' | 'PARTIALLY_REFUNDED' | 'TOTALLY_REFUNDED'

/** Transaction type in daily transaction reporting */
export type ReportingTransactionType = 'CANCEL' | 'PAYMENT' | 'REFUND'

// ─── Query param interfaces ─────────────────────────────────

/** Query params for the payment details reporting endpoint */
export interface ReportingPaymentDetailsParams extends BaseRequest {
	[key: string]: unknown
	/** Payment ID — required if `paymentConversationId` is not sent */
	paymentId?: string
	/** Conversation ID of the payment — required if `paymentId` is not sent */
	paymentConversationId?: string
}

/** Query params for the daily transactions reporting endpoint */
export interface ReportingDailyTransactionsParams extends BaseRequest {
	[key: string]: unknown
	/** Page number (1-based) */
	page: number
	/** Date to query (YYYY-MM-DD format, e.g. `2025-07-24`) */
	transactionDate: string
}

// ─── Nested sub-objects ─────────────────────────────────────

/** Converted payout details in reporting responses (FX fields differ from common ConvertedPayout) */
export interface ReportingConvertedPayout {
	/** Distribution of collected amount at line-item level */
	paidPrice: number
	/** iyzico commission amount (after conversion) */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee (after conversion) */
	iyziCommissionFee: number
	/** Merchant blockage amount (after conversion) */
	blockageRateAmountMerchant: number
	/** Sub-merchant blockage amount (after conversion) */
	blockageRateAmountSubMerchant: number
	/** Amount to be transferred to the sub-merchant (after conversion) */
	subMerchantPayoutAmount: number
	/** Amount to be sent to the merchant (after conversion) */
	merchantPayoutAmount: number
	/** FX conversion rate applied by iyzico */
	iyziConversionRate: number
	/** Amount after applying the FX rate */
	iyziConversionRateAmount: number
	/** Settlement currency */
	currency: Currency
}

/** Line-item refund in reporting responses */
export interface ReportingRefund {
	/** Refund transaction ID */
	refundTxId: string | number
	/** Conversation ID of the refund operation */
	refundConversationId: string
	/** Refund amount */
	refundPrice: number
	/** Refund status code */
	refundStatus: number
	/** Whether the refund was processed after settlement */
	isAfterSettlement: boolean
	/** ISO-8601 creation time */
	createdDate: string
	/** Refund currency */
	currencyCode: Currency
	/** Auth code returned from the bank */
	authCode: string
	/** Host reference value returned by the provider */
	hostReference: string
	/** Commission amount on the refund (if any) */
	iyziCommissionRateAmount: number
}

/** Line-item transaction breakdown in reporting payment details */
export interface ReportingItemTransaction {
	/** Line-item transaction ID */
	paymentTransactionId: string | number
	/**
	 * Line-item status.
	 * - `0`: Under fraud review
	 * - `-1`: Rejected after fraud review
	 * - `1`: Approved (in marketplace: awaiting sub-merchant approval)
	 * - `2`: Approved (marketplace approval granted)
	 */
	transactionStatus: 0 | -1 | 1 | 2
	/** Item amount */
	price: number
	/** Distribution of collected amount at line-item level */
	paidPrice: number
	/** Merchant surcharge/commission rate (line-item) */
	merchantCommissionRate: number
	/** Merchant surcharge/commission amount (line-item) */
	merchantCommissionRateAmount: number
	/** iyzico commission amount (line-item) */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee (line-item) */
	iyziCommissionFee: number
	/** Merchant blockage rate (line-item) */
	blockageRate: number
	/** Blockage amount reflected to the merchant */
	blockageRateAmountMerchant: number
	/** Blockage amount reflected to the sub-merchant */
	blockageRateAmountSubMerchant: number
	/** Blockage resolution date (ISO-8601) */
	blockageResolvedDate: string
	/** Sub-merchant item amount */
	subMerchantPrice: number
	/** Rate of payout to sub-merchant */
	subMerchantPayoutRate: number
	/** Amount to be transferred to the sub-merchant */
	subMerchantPayoutAmount: number
	/** Amount to be sent to the merchant after commissions and blockages */
	merchantPayoutAmount: number
	/** Converted payout details after currency conversion */
	convertedPayout: ReportingConvertedPayout
	/** Line-item refunds */
	refunds: ReportingRefund[]
}

/** Cancel operation in reporting payment details */
export interface ReportingCancel {
	/** Refund/cancel ID */
	refundId: string | number
	/** Conversation ID of the cancel operation */
	cancelConversationId: string
	/** Cancel/refund amount */
	refundPrice: number
	/** Cancel/refund status code */
	refundStatus: number
	/** ISO-8601 creation time */
	createdDate: string
	/** Cancel currency */
	currencyCode: Currency
	/** Auth code returned from the bank */
	authCode: string
	/** Host reference value returned by the provider */
	hostReference: string
}

/** Single payment item in the payment details reporting response */
export interface ReportingPaymentDetailsItem {
	/** Payment ID */
	paymentId: string | number
	/**
	 * Payment status.
	 * - `1`: Success
	 * - `2`: Failure / INIT_THREEDS
	 * - `3`: CALLBACK_THREEDS
	 */
	paymentStatus: ReportingPaymentStatus
	/** Refund status of the payment */
	paymentRefundStatus: ReportingRefundStatus
	/** Basket total amount */
	price: number
	/** Total collected amount */
	paidPrice: number
	/** Installment count */
	installment: number
	/** Merchant surcharge/commission rate (informational) */
	merchantCommissionRate: number
	/** Merchant surcharge/commission amount (informational) */
	merchantCommissionRateAmount: number
	/** iyzico commission amount for the payment */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee for the payment */
	iyziCommissionFee: number
	/** Conversation ID of the payment */
	paymentConversationId: string
	/**
	 * Fraud review status.
	 * - `1`: Approved
	 * - `0`: Under review
	 * - `-1`: Rejected
	 */
	fraudStatus: -1 | 0 | 1
	/** Card type */
	cardType: CardType
	/** Card association (scheme) */
	cardAssociation: CardAssociation
	/** Card family/program name */
	cardFamily: CardFamily
	/** BIN (first 8 digits of the card) */
	binNumber: string
	/** Last 4 digits of the card */
	lastFourDigits: string
	/** Basket ID */
	basketId: string
	/** Payment currency */
	currency: Currency
	/** Connector/POS provider name */
	connectorName: string
	/** Auth code returned from the bank */
	authCode: string
	/** Whether the transaction used 3D Secure */
	threeDS: boolean
	/** Payment phase */
	phase: string
	/** Acquiring bank/provider name */
	acquirerBankName: string
	/** Host reference value returned by the provider */
	hostReference: string
	/** ISO-8601 creation time */
	createdDate: string
	/** List of cancel operations on this payment */
	cancels: ReportingCancel[]
	/** Line-item level transaction breakdowns */
	itemTransactions: ReportingItemTransaction[]
}

/** Fields shared across all daily transaction types (PAYMENT, CANCEL, REFUND) */
interface ReportingDailyTransactionBase {
	/** Transaction time (`yyyy-MM-dd HH:mm:ss`) */
	transactionDate: string
	/** Transaction ID */
	transactionId: string | number
	/** Line-item payment transaction ID */
	paymentTxId: string | number
	/** Payment ID */
	paymentId: string | number
	/** Conversation ID of the transaction */
	conversationId: string
	/** Payment phase */
	paymentPhase: string
	/** Item/transaction amount */
	price: number
	/** Collected amount */
	paidPrice: number
	/** Transaction currency */
	transactionCurrency: Currency
	/** Installment count */
	installment: number
	/** Whether 3D Secure was used (`0` = No, `1` = Yes) */
	threeDS: 0 | 1
	/** Settlement currency */
	settlementCurrency: Currency
	/** Connector/POS provider type */
	connectorType: string
	/** POS order number */
	posOrderId: string
	/** Bank auth code */
	authCode: string
	/** Provider host reference value */
	hostReference: string
	/** Basket ID */
	basketId: string
}

/** PAYMENT transaction in daily transactions reporting */
export interface ReportingDailyPaymentTransaction extends ReportingDailyTransactionBase {
	transactionType: 'PAYMENT'
	/**
	 * Line-item status.
	 * - `0`: Under fraud review
	 * - `-1`: Rejected after fraud review
	 * - `1`: Approved (in marketplace: awaiting sub-merchant approval)
	 * - `2`: Approved (marketplace approval granted)
	 */
	transactionStatus: 0 | -1 | 1 | 2
	/** iyzico commission amount */
	iyzicoCommission: number
	/** iyzico transaction fee */
	iyzicoFee: number
	/** FX parity */
	parity: number
	/** FX conversion amount */
	iyzicoConversionAmount: number
	/** Amount to be paid to the merchant */
	merchantPayoutAmount: number
	/** Amount to be paid to the sub-merchant */
	subMerchantPayoutAmount: number
	/** Sub-merchant key (only present for marketplace payments) */
	subMerchantKey?: string
}

/** CANCEL transaction in daily transactions reporting */
export interface ReportingDailyCancelTransaction extends ReportingDailyTransactionBase {
	transactionType: 'CANCEL'
}

/** REFUND transaction in daily transactions reporting */
export interface ReportingDailyRefundTransaction extends ReportingDailyTransactionBase {
	transactionType: 'REFUND'
	/** Whether processed after settlement (`0` = No, `1` = Yes) */
	afterSettlement: 0 | 1
}

/**
 * Single transaction item in the daily transactions reporting response.
 *
 * Discriminated union on `transactionType`:
 * - `'PAYMENT'` — includes commission, payout, and parity fields
 * - `'CANCEL'`  — base fields only
 * - `'REFUND'`  — includes `afterSettlement`
 */
export type ReportingDailyTransactionItem =
	| ReportingDailyPaymentTransaction
	| ReportingDailyCancelTransaction
	| ReportingDailyRefundTransaction

// ─── Response data shapes ───────────────────────────────────

/** Success payload for the payment details reporting endpoint */
export interface ReportingPaymentDetailsResponse {
	/** Transactions returned by the query */
	payments: ReportingPaymentDetailsItem[]
}

/** Success payload for the daily transactions reporting endpoint */
export interface ReportingDailyTransactionsResponse {
	/** Transactions on the specified day */
	transactions: ReportingDailyTransactionItem[]
	/** Current page number (absent when result set is empty) */
	currentPage?: number
	/** Total number of pages (absent when result set is empty) */
	totalPageCount?: number
}
