import type { BaseRequest } from './common/api.js'
import type { CardAssociation, CardFamily, CardType } from './common/enum.js'

// ─── Request types ───────────────────────────────────────────────

/** Request to query available installment options */
export interface InstallmentQueryRequest extends BaseRequest {
	/** Basket total price (decimal string, e.g. `'100.0'`) */
	price: string
	/** Optional BIN number to filter installments for a specific card */
	binNumber?: string
}

// ─── Response sub-objects ────────────────────────────────────────

/** Price breakdown for a single installment option */
export interface InstallmentPrice {
	/** Monthly payment amount */
	installmentPrice: number
	/** Total amount across all installments */
	totalPrice: number
	/** Number of installments */
	installmentNumber: number
}

/** Installment options for a specific card/bank combination */
export interface InstallmentDetail {
	/** BIN number — absent when querying all banks without a BIN filter */
	binNumber?: string
	/** Queried price echoed back */
	price: number
	/** Card type — absent for unknown BINs and all-bank queries */
	cardType?: CardType
	/** Card association / scheme — absent for unknown BINs and all-bank queries */
	cardAssociation?: CardAssociation
	/** Card family/program name — absent for unknown BINs */
	cardFamilyName?: CardFamily
	/** Issuing bank name — absent for unknown BINs */
	bankName?: string
	/** Issuing bank code — absent for unknown BINs */
	bankCode?: number
	/** Whether 3DS is mandatory — `0` = optional, `1` = required */
	force3ds: 0 | 1
	/** Whether CVC is mandatory — `0` = optional, `1` = required */
	forceCvc: 0 | 1
	/** Whether the card is commercial — absent for unknown BINs and all-bank queries */
	commercial?: 0 | 1
	/** Whether DCC (Dynamic Currency Conversion) is enabled */
	dccEnabled: 0 | 1
	/** Whether agriculture card support is enabled */
	agricultureEnabled: 0 | 1
	/** Available installment price breakdowns */
	installmentPrices: InstallmentPrice[]
}

// ─── Response types ──────────────────────────────────────────────

/** Installment query success response */
export interface InstallmentQueryResponse {
	/** Available installment options per card/bank */
	installmentDetails: InstallmentDetail[]
}
