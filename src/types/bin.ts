import type { BaseRequest } from './common/api.js'
import type { CardAssociation, CardFamily, CardType } from './common/enum.js'

// ─── Request types ───────────────────────────────────────────────

/** Request to check a card BIN (first 6–8 digits) */
export interface BinCheckRequest extends BaseRequest {
	/** First 6–8 digits of the card number */
	binNumber: string
}

// ─── Response types ──────────────────────────────────────────────

/** BIN check success response — card metadata from the BIN lookup */
export interface BinCheckResponse {
	/** BIN number echoed back */
	binNumber: string
	/** Card type (`CREDIT_CARD`, `DEBIT_CARD`, `PREPAID_CARD`) */
	cardType: CardType
	/** Card association / scheme (`VISA`, `MASTER_CARD`, `AMERICAN_EXPRESS`, `TROY`) */
	cardAssociation: CardAssociation
	/** Card family/program name (`Bonus`, `Axess`, `World`, etc.) */
	cardFamily: CardFamily
	/** Issuing bank name */
	bankName: string
	/** Issuing bank code */
	bankCode: number
	/** Whether the card is a commercial (corporate) card — `0` = personal, `1` = commercial */
	commercial: 0 | 1
}
