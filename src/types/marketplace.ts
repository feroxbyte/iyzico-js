import type { BaseRequest } from './common/api.js'
import type { Currency } from './common/enum.js'
import type { ConvertedPayout } from './common/transaction.js'

// ─── Sub-Merchant Create variants ───────────────────────────────

export type SubMerchantType = 'PERSONAL' | 'PRIVATE_COMPANY' | 'LIMITED_OR_JOINT_STOCK_COMPANY'

export interface SubmerchantPersonal extends BaseRequest {
	subMerchantType: 'PERSONAL'
	/** Sub-merchant (store) name */
	name?: string
	/** Sub-merchant email */
	email: string
	/** Sub-merchant phone number */
	gsmNumber: string
	/** Sub-merchant address */
	address: string
	/** Sub-merchant IBAN */
	iban?: string
	/** Contact first name */
	contactName: string
	/** Contact last name */
	contactSurname: string
	/**
	 * Sub-merchant unique external ID. This is a value created by the merchant.
	 * You can specify a value to match with the sub-merchant in your system.
	 **/
	subMerchantExternalId: string
	/** National ID (TCKN) */
	identityNumber: string
	/** Currency */
	currency?: Currency
}

export interface SubmerchantPrivateCompany extends BaseRequest {
	subMerchantType: 'PRIVATE_COMPANY'
	/** Sub-merchant (store) name */
	name?: string
	/** Sub-merchant email */
	email: string
	/** Sub-merchant phone number */
	gsmNumber: string
	/** Sub-merchant address */
	address: string
	/** Sub-merchant IBAN */
	iban?: string
	/** Tax office */
	taxOffice: string
	/** Tax number */
	taxNumber?: string
	/** Registered company title */
	legalCompanyTitle: string
	/**
	 * Sub-merchant unique external ID. This is a value created by the merchant.
	 * You can specify a value to match with the sub-merchant in your system.
	 **/
	subMerchantExternalId: string
	/** National ID (TCKN) */
	identityNumber?: string
	/** Currency */
	currency?: Currency
}

export interface SubmerchantLimitedCompany extends BaseRequest {
	subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY'
	/** Sub-merchant (store) name */
	name?: string
	/** Sub-merchant email */
	email: string
	/** Sub-merchant phone number */
	gsmNumber: string
	/** Sub-merchant address */
	address: string
	/** Sub-merchant IBAN */
	iban?: string
	/** Tax office */
	taxOffice: string
	/** Tax number */
	taxNumber: string
	/** Registered company title */
	legalCompanyTitle: string
	/**
	 * Sub-merchant unique external ID. This is a value created by the merchant.
	 * You can specify a value to match with the sub-merchant in your system.
	 **/
	subMerchantExternalId: string
	/** National ID (TCKN) */
	identityNumber?: string
	/** Currency */
	currency?: Currency
}

/** Union of all sub-merchant create variants, discriminated by subMerchantType */
export type SubMerchantCreateRequest = SubmerchantPersonal | SubmerchantPrivateCompany | SubmerchantLimitedCompany

// ─── Sub-Merchant Update variants ───────────────────────────────
// Derived from create types: removes subMerchantType/subMerchantExternalId, adds subMerchantKey, makes iban required

type CreateToUpdate<T> = Omit<T, 'subMerchantType' | 'subMerchantExternalId' | 'iban'> & {
	subMerchantKey: string
	iban: string
}

export type SubmerchantPersonalUpdate = CreateToUpdate<SubmerchantPersonal>

export type SubmerchantPrivateCompanyUpdate = CreateToUpdate<SubmerchantPrivateCompany> & {
	identityNumber: string
}

export type SubmerchantLimitedCompanyUpdate = Omit<CreateToUpdate<SubmerchantLimitedCompany>, 'taxNumber'> & {
	identityNumber: string
	taxNumber?: string
}

/** Union of all sub-merchant update variants (no subMerchantType discriminator) */
export type SubMerchantUpdateRequest =
	| SubmerchantPersonalUpdate
	| SubmerchantPrivateCompanyUpdate
	| SubmerchantLimitedCompanyUpdate

/** Request to retrieve sub-merchant details by external ID */
export interface SubMerchantRetrieveRequest extends BaseRequest {
	/** External ID of the sub-merchant to query */
	subMerchantExternalId: string
}

// ─── Sub-Merchant Response types ────────────────────────────────

/** Sub-merchant create success response */
export interface SubMerchantCreateResponse {
	/** Generated sub-merchant key — must be stored for payment operations */
	subMerchantKey: string
}

/** Fields shared across all sub-merchant retrieve response variants */
interface SubMerchantRetrieveBase {
	/** Sub-merchant (store) name — optional on create */
	name?: string
	/** Sub-merchant email */
	email: string
	/** Sub-merchant phone number */
	gsmNumber: string
	/** Sub-merchant address */
	address: string
	/** Sub-merchant IBAN — optional on create */
	iban?: string
	/** Bank country — derived from IBAN, present when IBAN is set */
	bankCountry?: string
	/** Currency */
	currency: string
	/** External unique ID */
	subMerchantExternalId: string
	/** Sub-merchant key */
	subMerchantKey: string
}

/** Retrieve response for PERSONAL sub-merchants */
export interface SubMerchantRetrievePersonal extends SubMerchantRetrieveBase {
	subMerchantType: 'PERSONAL'
	/** Contact first name */
	contactName: string
	/** Contact last name */
	contactSurname: string
	/** National ID (TCKN) */
	identityNumber: string
}

/** Retrieve response for PRIVATE_COMPANY sub-merchants */
export interface SubMerchantRetrievePrivateCompany extends SubMerchantRetrieveBase {
	subMerchantType: 'PRIVATE_COMPANY'
	/** Tax office */
	taxOffice: string
	/** Registered company title */
	legalCompanyTitle: string
	/** Tax number — optional on create */
	taxNumber?: string
	/** National ID (TCKN) — optional for company types */
	identityNumber?: string
}

/** Retrieve response for LIMITED_OR_JOINT_STOCK_COMPANY sub-merchants */
export interface SubMerchantRetrieveLimitedCompany extends SubMerchantRetrieveBase {
	subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY'
	/** Tax office */
	taxOffice: string
	/** Tax number */
	taxNumber: string
	/** Registered company title */
	legalCompanyTitle: string
	/** National ID (TCKN) — optional for company types */
	identityNumber?: string
}

/**
 * Sub-merchant retrieve success response.
 *
 * Discriminated union on `subMerchantType`:
 * - `'PERSONAL'` — includes contactName, contactSurname, identityNumber
 * - `'PRIVATE_COMPANY'` — includes taxOffice, legalCompanyTitle
 * - `'LIMITED_OR_JOINT_STOCK_COMPANY'` — includes taxOffice, taxNumber, legalCompanyTitle
 */
export type SubMerchantRetrieveResponse =
	| SubMerchantRetrievePersonal
	| SubMerchantRetrievePrivateCompany
	| SubMerchantRetrieveLimitedCompany

// ─── Item Payout Update types ────────────────────────────────────

/** Request to update the sub-merchant or payout amount on a payment transaction item */
export interface ItemPayoutUpdateRequest extends BaseRequest {
	/** Payment transaction (split) ID */
	paymentTransactionId: string
	/** Sub-merchant key to assign */
	subMerchantKey: string
	/** Amount to transfer to the sub-merchant */
	subMerchantPrice: number
}

/** Item payout update success response */
export interface ItemPayoutUpdateResponse {
	/** Basket item ID */
	itemId: string
	/** Payment transaction (split) ID */
	paymentTransactionId: string
	/** Transaction status code */
	transactionStatus: number
	/** Item amount */
	price: number
	/** Collected amount */
	paidPrice: number
	/** Merchant surcharge/commission rate */
	merchantCommissionRate: number
	/** Merchant surcharge/commission amount */
	merchantCommissionRateAmount: number
	/** iyzico commission amount */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee */
	iyziCommissionFee: number
	/** Blockage rate */
	blockageRate: number
	/** Blockage amount reflected to the merchant */
	blockageRateAmountMerchant: number
	/** Blockage amount reflected to the sub-merchant */
	blockageRateAmountSubMerchant: number
	/** Blockage resolution date */
	blockageResolvedDate: string
	/** Sub-merchant key */
	subMerchantKey: string
	/** External sub-merchant ID assigned by the merchant */
	externalSubMerchantId: string
	/** Sub-merchant item amount */
	subMerchantPrice: number
	/** Rate of payout to sub-merchant */
	subMerchantPayoutRate: number
	/** Amount to be transferred to the sub-merchant */
	subMerchantPayoutAmount: number
	/** Amount to be sent to the merchant */
	merchantPayoutAmount: number
	/** Converted payout details after currency conversion */
	convertedPayout: ConvertedPayout
}

// ─── Approval Request types ─────────────────────────────────────

/** Request to approve or disapprove a payment item in the marketplace model */
export interface ApprovalRequest extends BaseRequest {
	/** Payment transaction ID (split ID) to approve or disapprove */
	paymentTransactionId: string
}

// ─── Approval Response types ────────────────────────────────────

/** Approval/disapproval success response */
export interface ApprovalResponse {
	/** Payment transaction ID that was approved/disapproved */
	paymentTransactionId: string
}
