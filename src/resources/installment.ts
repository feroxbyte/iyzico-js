import type { HttpClient } from '../core/http.js'
import type { ApiResponse } from '../types/common/api.js'
import type { InstallmentQueryRequest, InstallmentQueryResponse } from '../types/installment.js'

export class InstallmentResource {
	constructor(private http: HttpClient) {}

	/**
	 * Queries installment options for a price and optional BIN.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.installment.query({
	 *   price: '100.0',
	 *   binNumber: '454671',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/taksit-ve-bin-sorgulama | Taksit ve BIN Sorgulama}
	 */
	async query(request: InstallmentQueryRequest): Promise<ApiResponse<InstallmentQueryResponse>> {
		return this.http.post('/payment/iyzipos/installment', request)
	}
}
