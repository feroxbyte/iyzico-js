/** Converted payout details when payment currency differs from settlement currency */
export interface ConvertedPayout {
	/** Paid price portion allocated to this item */
	paidPrice: number
	/** iyzico commission amount allocated to this item */
	iyziCommissionRateAmount: number
	/** iyzico transaction fee allocated to this item */
	iyziCommissionFee: number
	/** Merchant blockage amount (withheld from merchant payout) */
	blockageRateAmountMerchant: number
	/** Sub-merchant blockage amount */
	blockageRateAmountSubMerchant: number
	/** Net amount to be transferred to the sub-merchant */
	subMerchantPayoutAmount: number
	/** Net amount to be paid out to the merchant after all deductions */
	merchantPayoutAmount: number
	/** Currency conversion rate applied by iyzico */
	iyziConversionRate: number
	/** Converted amount after applying the conversion rate */
	iyziConversionRateAmount: number
	/** Currency code */
	currency: string
}

/** Per-item transaction breakdown returned in payment responses */
export interface ItemTransaction {
	/** Unique ID for this item transaction — must be stored for refund, approval, and dispute operations */
	paymentTransactionId: string
	/** Merchant-assigned item ID echoed from the basket */
	itemId: string
	/** Item price as sent in the request */
	price: number
	/** Portion of `paidPrice` allocated to this item — must be stored by the merchant */
	paidPrice: number
	/**
	 * Transaction status for this item.
	 * - `0`: Under fraud review
	 * - `-1`: Rejected after fraud review
	 * - `1`: Approved (in marketplace: awaiting merchant approval)
	 * - `2`: Approved (marketplace approval given)
	 */
	transactionStatus: 0 | -1 | 1 | 2
	/** Merchant blockage rate (percentage) applied to this item */
	blockageRate: number
	/** Merchant blockage amount withheld from the merchant payout */
	blockageRateAmountMerchant: number
	/** Sub-merchant blockage amount withheld from the sub-merchant payout */
	blockageRateAmountSubMerchant: number
	/** Date when the blockage is resolved (format: `yyyy-MM-dd HH:mm:ss`) */
	blockageResolvedDate: string
	/** iyzico transaction fee allocated to this item */
	iyziCommissionFee: number
	/** iyzico commission amount allocated to this item */
	iyziCommissionRateAmount: number
	/** Merchant commission rate (percentage) distributed to this item */
	merchantCommissionRate: number
	/** Merchant commission amount distributed to this item */
	merchantCommissionRateAmount: number
	/** Net amount to be paid out to the merchant after fees, commission, and blockage */
	merchantPayoutAmount: number
	/** Sub-merchant key — only present in marketplace payments */
	subMerchantKey?: string
	/** External sub-merchant ID assigned by the merchant — only present in marketplace payments */
	externalSubMerchantId?: string
	/** Sub-merchant share amount (defaults to `0` in non-marketplace payments) */
	subMerchantPrice: number
	/** Sub-merchant payout rate (defaults to `0` in non-marketplace payments) */
	subMerchantPayoutRate: number
	/** Net amount to be transferred to the sub-merchant (defaults to `0` in non-marketplace payments) */
	subMerchantPayoutAmount: number
	/** Withholding tax amount — only present if sent in the request */
	withholdingTax?: number
	/** Converted payout details (always present, zeroed-out in non-marketplace / same-currency payments) */
	convertedPayout: ConvertedPayout
}
