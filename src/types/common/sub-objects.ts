import type { ItemType } from './enum.js'

/** Card details for a payment request */
export interface PaymentCard {
	/** Cardholder full name @example "John Doe" */
	cardHolderName: string
	/** Card number @example "5528790000000008" */
	cardNumber: string
	/** Expiry year (YYYY format) @example "2030" */
	expireYear: string
	/** Expiry month (MM format) @example "12" */
	expireMonth: string
	/** CVC code @example "123" */
	cvc: string
	/** Save the card? (0 = no, 1 = yes) @example 0 */
	registerCard?: number
}

/**
 * Stored card reference for paying with a previously registered card (NON3D or 3DS).
 *
 * After registering a card via `cardStorage.create()`, use the returned `cardUserKey`
 * and `cardToken` in payment requests instead of raw card details. This enables
 * one-click payments and subscription billing without re-entering card information.
 *
 * @example
 * ```ts
 * const result = await iyzipay.payment.create({
 *   ...paymentRequest,
 *   paymentCard: {
 *     cardUserKey: 'stored-user-key',
 *     cardToken: 'stored-card-token',
 *   },
 * })
 * ```
 *
 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama | Kart Saklama}
 */
export interface PaymentCardSaved {
	cardUserKey: string
	cardToken: string
}

/** Buyer (customer) information */
export interface Buyer {
	/** Customer ID @example "BY789" */
	id: string
	/** First name @example "John" */
	name: string
	/** Last name @example "Doe" */
	surname: string
	/** National ID number (TR) @example "11111111111" */
	identityNumber: string
	/** Email @example "john.doe@email.com" */
	email: string
	/** Phone number @example "+905350000000" */
	gsmNumber: string
	/** Registration date (yyyy-MM-dd HH:mm:ss) @example "2013-04-21 15:12:09" */
	registrationDate?: string
	/** Last login date (yyyy-MM-dd HH:mm:ss) @example "2015-10-05 12:43:35" */
	lastLoginDate?: string
	/** Address @example "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1" */
	registrationAddress: string
	/** City @example "Istanbul" */
	city: string
	/** Country @example "Turkey" */
	country: string
	/** Postal code @example "34732" */
	zipCode?: string
	/** IP address @example "85.34.78.112" */
	ip?: string
}

/** Shipping or billing address */
export interface Address {
	/** Full address @example "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1" */
	address: string
	/** Postal code @example "34742" */
	zipCode?: string
	/** Contact person @example "Jane Doe" */
	contactName: string
	/** City @example "Istanbul" */
	city: string
	/** Country @example "Turkey" */
	country: string
}

/** Individual item in the payment basket */
export interface BasketItem {
	/** Product ID @example "BI101" */
	id: string
	/** Product price @example "0.4" */
	price: string
	/** Product name @example "Binocular" */
	name: string
	/** Primary category @example "Collectibles" */
	category1: string
	/** Secondary category (optional) @example "Accessories" */
	category2?: string
	/** Item type @example "PHYSICAL" */
	itemType: ItemType
	/** Sub-merchant key for the service provider. Not sent in the standard business model. Required only for marketplace model. @example "bzXH3+wgGQjzzlp5rKwnnacJVVM=" */
	subMerchantKey?: string
	/** Amount to be transferred to the sub-merchant. Not sent in the standard business model. Required only for marketplace model. @example "1" */
	subMerchantPrice?: string
	/** Withholding tax amount. Marketplace can deduct this from the sub-merchant payout. Recorded for informational purposes; iyzico does not calculate it. */
	withholdingTax?: string
}
