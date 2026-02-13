import type { HttpClient } from '../core/http.js'
import type { BinCheckRequest, BinCheckResponse } from '../types/bin.js'
import type { ApiResponse } from '../types/common/api.js'

export class BinResource {
	constructor(private http: HttpClient) {}

	/**
	 * Checks a card BIN and returns card metadata.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.bin.check({
	 *   binNumber: '454671',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/taksit-ve-bin-sorgulama | Taksit ve BIN Sorgulama}
	 */
	async check(request: BinCheckRequest): Promise<ApiResponse<BinCheckResponse>> {
		return this.http.post('/payment/bin/check', request)
	}
}
