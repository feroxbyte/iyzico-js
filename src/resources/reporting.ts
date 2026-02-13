import type { HttpClient } from '../core/http.js'
import { buildQueryString } from '../lib/query-string.js'
import type { ApiResponse } from '../types/common/api.js'
import type {
	ReportingDailyTransactionsParams,
	ReportingDailyTransactionsResponse,
	ReportingPaymentDetailsParams,
	ReportingPaymentDetailsResponse,
} from '../types/reporting.js'

export class ReportingResource {
	constructor(private http: HttpClient) {}

	/**
	 * Retrieve detailed payment information by `paymentId` or `paymentConversationId`.
	 *
	 * @remarks
	 * The reporting service returns the current status of payments, refund results,
	 * and fraud statuses. At least one of `paymentId` or `paymentConversationId`
	 * must be provided.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.reporting.getPaymentDetails({ paymentId: '12345678' })
	 * if (res.status === 'success') {
	 *   for (const p of res.payments) {
	 *     console.log(p.paymentId, p.paymentStatus)
	 *   }
	 * }
	 * ```
	 */
	async getPaymentDetails(
		params: ReportingPaymentDetailsParams,
	): Promise<ApiResponse<ReportingPaymentDetailsResponse>> {
		return this.http.get(`/v2/reporting/payment/details${buildQueryString(params)}`)
	}

	/**
	 * List daily payment, cancel, and refund transactions for a specific date.
	 *
	 * @remarks
	 * Returns a paginated list of all transactions (payments, cancels, refunds)
	 * that occurred on the given `transactionDate`. Use `page` for pagination.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.reporting.getDailyTransactions({
	 *   page: 1,
	 *   transactionDate: '2025-07-24',
	 * })
	 * if (res.status === 'success') {
	 *   console.log(`Page ${res.currentPage} of ${res.totalPageCount}`)
	 *   for (const tx of res.transactions) {
	 *     console.log(tx.transactionType, tx.paymentId)
	 *   }
	 * }
	 * ```
	 */
	async getDailyTransactions(
		params: ReportingDailyTransactionsParams,
	): Promise<ApiResponse<ReportingDailyTransactionsResponse>> {
		return this.http.get(`/v2/reporting/payment/transactions${buildQueryString(params)}`)
	}
}
