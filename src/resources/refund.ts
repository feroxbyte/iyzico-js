import type { HttpClient } from '../core/http.js'
import type { ApiResponse } from '../types/common/api.js'
import type {
	RefundAmountBasedCreateRequest,
	RefundAmountBasedResponse,
	RefundCreateRequest,
	RefundResponse,
} from '../types/refund.js'

export class RefundResource {
	constructor(private http: HttpClient) {}

	/**
	 * Creates an item-based refund (V1) by `paymentTransactionId`.
	 *
	 * @remarks
	 * Refunds a specific basket item from the payment. The `paymentTransactionId`
	 * identifies a single line item returned in the original payment response.
	 * Supports partial refunds — the `price` can be less than the item's original amount.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.refund.create({
	 *   paymentTransactionId: '22334455',
	 *   price: '50.0',
	 *   ip: '85.34.78.112',
	 *   currency: 'TRY',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ileri-seviye/iade-ve-iptal | İade ve İptal}
	 */
	async create(request: RefundCreateRequest): Promise<ApiResponse<RefundResponse>> {
		return this.http.post('/payment/refund', request)
	}

	/**
	 * Creates an amount-based refund (V2) by `paymentId`.
	 *
	 * @remarks
	 * Refunds an arbitrary amount from the entire payment without specifying individual
	 * basket items. This is simpler than item-based refunds when you don't need to track
	 * which specific items are being returned. The `price` can be the full or partial amount.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.refund.createAmountBased({
	 *   paymentId: '12345678',
	 *   price: '30.0',
	 *   ip: '85.34.78.112',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/iptal-ve-iade | İptal ve İade}
	 */
	async createAmountBased(request: RefundAmountBasedCreateRequest): Promise<ApiResponse<RefundAmountBasedResponse>> {
		return this.http.post('/v2/payment/refund', request)
	}

	/**
	 * Creates an item-based refund charged from the merchant's balance.
	 *
	 * @remarks
	 * Works like {@link create} but the refund amount is deducted from the **merchant's
	 * iyzico balance** rather than reversing the original card transaction. Useful in
	 * marketplace scenarios where the sub-merchant has already been paid out.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.refund.createChargedFromMerchant({
	 *   paymentTransactionId: '22334455',
	 *   price: '50.0',
	 *   ip: '85.34.78.112',
	 *   currency: 'TRY',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/iptal-ve-iade | İptal ve İade}
	 */
	async createChargedFromMerchant(request: RefundCreateRequest): Promise<ApiResponse<RefundResponse>> {
		return this.http.post('/payment/iyzipos/refund/merchant/charge', request)
	}
}
