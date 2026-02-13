import type { HttpClient } from '../core/http.js'
import type { CancelCreateRequest, CancelResponse } from '../types/cancel.js'
import type { ApiResponse } from '../types/common/api.js'

export class CancelResource {
	constructor(private http: HttpClient) {}

	/**
	 * Cancels (voids) an entire payment made today.
	 *
	 * @remarks
	 * The payment is reversed in full before bank settlement. The charge will not
	 * appear on the cardholder's statement. Can only be called on the same calendar
	 * day as the original payment — after settlement, use `refund.create()` instead.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.cancel.create({
	 *   paymentId: '12345678',
	 *   ip: '85.34.78.112',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/iptal-ve-iade | İptal ve İade}
	 */
	async create(request: CancelCreateRequest): Promise<ApiResponse<CancelResponse>> {
		return this.http.post('/payment/cancel', request)
	}
}
