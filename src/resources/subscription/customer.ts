import type { HttpClient } from '../../core/http.js'
import { buildQueryString } from '../../lib/query-string.js'
import type { ResponsePaginatedV2, ResponseV2 } from '../../types/common/v2.js'
import type {
	SubscriptionCustomerListParams,
	SubscriptionCustomerUpdateRequest,
} from '../../types/subscription/customer.js'
import type { SubscriptionCustomerData } from '../../types/subscription/index.js'

export class SubscriptionCustomerResource {
	constructor(private http: HttpClient) {}

	/**
	 * Retrieve a subscription customer by reference code.
	 *
	 * @remarks
	 * Returns the full subscriber profile including name, contact details,
	 * and billing/shipping addresses. The `referenceCode` is the
	 * `customerReferenceCode` returned during subscription initialization.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.customer.retrieve('cust-ref-001')
	 * if (res.status === 'success') {
	 *   console.log(res.data.email) // subscriber email
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abone-islemleri#get-v2-subscription-customers-customerreferencecode | Abone Detayı }
	 */
	async retrieve(customerReferenceCode: string): Promise<ResponseV2<SubscriptionCustomerData>> {
		return this.http.get(`/v2/subscription/customers/${customerReferenceCode}`)
	}

	/**
	 * Update a subscription customer's information.
	 *
	 * @remarks
	 * Performs a partial update — only the fields included in the request body
	 * will be modified. Omitted fields remain unchanged.
	 *
	 * Common use cases include updating a customer's billing address after
	 * a move, or correcting contact information.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.customer.update('cust-ref-001', {
	 *   name: 'Jane',
	 *   billingAddress: {
	 *     address: 'Yeni Adres Sok. No:5',
	 *     contactName: 'Jane Doe',
	 *     city: 'Ankara',
	 *     country: 'Turkey',
	 *   },
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abone-islemleri#post-v2-subscription-customers-customerreferencecode | Abone Güncelleme }
	 */
	async update(
		customerReferenceCode: string,
		request: SubscriptionCustomerUpdateRequest,
	): Promise<ResponseV2<SubscriptionCustomerData>> {
		return this.http.post(`/v2/subscription/customers/${customerReferenceCode}`, request)
	}

	/**
	 * List all subscription customers with pagination.
	 *
	 * @remarks
	 * Returns a paginated list of all subscribers in your iyzico account.
	 * Use `page` and `count` to navigate through results.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.customer.list({ page: 1, count: 10 })
	 * if (res.status === 'success') {
	 *   console.log(res.data.totalCount) // total subscribers
	 *   res.data.items.forEach(c => console.log(c.email))
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abone-islemleri#get-v2-subscription-customers | Abone Listeleme }
	 */
	async list(params?: SubscriptionCustomerListParams): Promise<ResponsePaginatedV2<SubscriptionCustomerData>> {
		return this.http.get(`/v2/subscription/customers${buildQueryString(params)}`)
	}
}
