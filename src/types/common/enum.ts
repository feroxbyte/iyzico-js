/** Request/response locale */
export type Locale = 'tr' | 'en'

/** ISO 4217 currency codes supported by iyzico */
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP' | 'NOK' | 'CHF'

/** Payment grouping for reporting and settlement */
export type PaymentGroup = 'PRODUCT' | 'LISTING' | 'SUBSCRIPTION'

/** Channel through which the payment is initiated */
export type PaymentChannel =
	| 'MOBILE'
	| 'WEB'
	| 'MOBILE_WEB'
	| 'MOBILE_IOS'
	| 'MOBILE_ANDROID'
	| 'MOBILE_WINDOWS'
	| 'MOBILE_TABLET'
	| 'MOBILE_PHONE'

/** Basket item type */
export type ItemType = 'PHYSICAL' | 'VIRTUAL'

/** Card type returned in payment responses */
export type CardType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PREPAID_CARD'

/** Card association (scheme) returned in payment responses */
export type CardAssociation = 'VISA' | 'MASTER_CARD' | 'AMERICAN_EXPRESS' | 'TROY'

/** Card family/program name returned in payment and BIN check responses */
export type CardFamily = 'Bonus' | 'Axess' | 'World' | 'Maximum' | 'Paraf' | 'CardFinans' | (string & {})
