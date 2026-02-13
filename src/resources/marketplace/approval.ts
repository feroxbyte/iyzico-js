import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type { ApprovalRequest, ApprovalResponse } from '../../types/marketplace.js'

export class ApprovalResource {
	constructor(private http: HttpClient) {}

	/**
	 * Approves a basket item, releasing escrowed funds to the sub-merchant.
	 *
	 * @remarks
	 * Once approved, the sub-merchant's payout for this item will be included in the
	 * next settlement cycle. Use the `paymentTransactionId` from the original payment
	 * response to identify the specific basket item.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.marketplace.approval.approve({
	 *   paymentTransactionId: '22334455',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/onay#post-payment-iyzipos-item-approve | Onay}
	 */
	async approve(request: ApprovalRequest): Promise<ApiResponse<ApprovalResponse>> {
		return this.http.post('/payment/iyzipos/item/approve', request)
	}

	/**
	 * Disapproves a basket item, re-holding funds in escrow.
	 *
	 * @remarks
	 * Reverses a previous approval — the sub-merchant will not receive payout for this
	 * item until it is approved again. Useful when a customer returns an item after
	 * the merchant had already approved payout.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.marketplace.approval.disapprove({
	 *   paymentTransactionId: '22334455',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/onay#post-payment-iyzipos-item-disapprove | Onay}
	 */
	async disapprove(request: ApprovalRequest): Promise<ApiResponse<ApprovalResponse>> {
		return this.http.post('/payment/iyzipos/item/disapprove', request)
	}
}
