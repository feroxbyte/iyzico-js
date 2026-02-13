import type { BaseRequest } from './common/api.js'
import type { CardAssociation, CardFamily, CardType } from './common/enum.js'

// ─── Sub-objects ─────────────────────────────────────────────

/** Card details for card storage registration (no CVC required) */
export interface CardStorageCard {
	/** User-friendly card label @example "My Visa Card" */
	cardAlias?: string
	/** Cardholder full name @example "John Doe" */
	cardHolderName: string
	/** Card number @example "5528790000000008" */
	cardNumber: string
	/** Expiry year (YYYY format) @example "2030" */
	expireYear: string
	/** Expiry month (MM format) @example "12" */
	expireMonth: string
}

// ─── Request types ───────────────────────────────────────────

/** Register a card for a new user (creates a new `cardUserKey`) */
export interface CardCreateNewUserRequest extends BaseRequest {
	/** User email — creates a new card user @example "john@example.com" */
	email: string
	/** Optional external user identifier */
	externalId?: string
	/** Card to register */
	card: CardStorageCard
}

/** Register a card for an existing user (adds to existing `cardUserKey`) */
export interface CardCreateExistingUserRequest extends BaseRequest {
	/** Existing card user key from a previous registration @example "card-user-key-abc123" */
	cardUserKey: string
	/** Card to register */
	card: CardStorageCard
}

/** Card registration request — new user (via `email`) or existing user (via `cardUserKey`) */
export type CardCreateRequest = CardCreateNewUserRequest | CardCreateExistingUserRequest

/** Request to list all stored cards for a user */
export interface CardListRequest extends BaseRequest {
	/** Card user key returned from a previous card registration */
	cardUserKey: string
}

/** Request to delete a stored card */
export interface CardDeleteRequest extends BaseRequest {
	/** Card user key */
	cardUserKey: string
	/** Token of the specific card to delete */
	cardToken: string
}

// ─── Response types ──────────────────────────────────────────

/** Card registration success response */
export interface CardCreateResponse {
	/** Unique key identifying the card user — store this for future operations */
	cardUserKey: string
	/** Token identifying the registered card */
	cardToken: string
	/** BIN number (first 6 digits) */
	binNumber: string
	/** Last 4 digits of the card */
	lastFourDigits: string
	/** Card type — absent for some non-Turkish cards */
	cardType?: CardType
	/** Card association / scheme — absent for some non-Turkish cards */
	cardAssociation?: CardAssociation
	/** Card family/program name — absent for some non-Turkish cards */
	cardFamily?: CardFamily
	/** Card alias echoed from the request */
	cardAlias: string
	/** Bank code — absent for some non-Turkish cards */
	cardBankCode?: number
	/** Bank name — absent for some non-Turkish cards */
	cardBankName?: string
	/** User email — only returned for new user registrations */
	email?: string
	/** External ID — only echoed when sent in the request */
	externalId?: string
}

/** Individual card in the card list response */
export interface CardListItem {
	/** Token identifying this card */
	cardToken: string
	/** Card alias */
	cardAlias: string
	/** BIN number (first 6 digits) */
	binNumber: string
	/** Last 4 digits of the card */
	lastFourDigits: string
	/** Card type — absent for some non-Turkish cards */
	cardType?: CardType
	/** Card association / scheme — absent for some non-Turkish cards */
	cardAssociation?: CardAssociation
	/** Card family/program name — absent for some non-Turkish cards */
	cardFamily?: CardFamily
	/** Bank code — absent for some non-Turkish cards */
	cardBankCode?: number
	/** Bank name — absent for some non-Turkish cards */
	cardBankName?: string
	/** Expiry month */
	expireMonth: string
	/** Expiry year */
	expireYear: string
}

/** Card list success response */
export interface CardListResponse {
	/** Card user key */
	cardUserKey: string
	/** List of stored cards */
	cardDetails: CardListItem[]
}
