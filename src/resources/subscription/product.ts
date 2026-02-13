import type { HttpClient } from '../../core/http.js'
import { buildQueryString } from '../../lib/query-string.js'
import type { ResponseBaseV2, ResponsePaginatedV2, ResponseV2 } from '../../types/common/v2.js'
import type { SubscriptionProductData } from '../../types/subscription/index.js'
import type {
	SubscriptionProductCreateRequest,
	SubscriptionProductListParams,
	SubscriptionProductUpdateRequest,
} from '../../types/subscription/product.js'

export class SubscriptionProductResource {
	constructor(private http: HttpClient) {}

	/**
	 * Create a new subscription product.
	 *
	 * @remarks
	 * Product names must be unique. After creation, add pricing plans via
	 * `iyzipay.subscription.pricingPlan.create()`.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.product.create({
	 *   name: 'Premium Magazine',
	 *   description: 'Monthly premium content subscription',
	 * })
	 * if (res.status === 'success') {
	 *   console.log(res.data.referenceCode) // product reference for pricing plans
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	async create(request: SubscriptionProductCreateRequest): Promise<ResponseV2<SubscriptionProductData>> {
		return this.http.post('/v2/subscription/products', request)
	}

	/**
	 * Update a subscription product's name and/or description.
	 *
	 * @remarks
	 * Both `name` and `description` can be updated. The updated name must still
	 * be unique across your merchant account.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.product.update('prod-ref-001', {
	 *   name: 'Premium Magazine v2',
	 *   description: 'Updated description',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	async update(
		productReferenceCode: string,
		request: SubscriptionProductUpdateRequest,
	): Promise<ResponseV2<SubscriptionProductData>> {
		return this.http.post(`/v2/subscription/products/${productReferenceCode}`, request)
	}

	/**
	 * Retrieve a subscription product by reference code.
	 *
	 * @remarks
	 * Returns the product details along with a summary of its linked pricing plans.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.product.retrieve('prod-ref-001')
	 * if (res.status === 'success') {
	 *   console.log(res.data.name, res.data.pricingPlans.length)
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	async retrieve(productReferenceCode: string): Promise<ResponseV2<SubscriptionProductData>> {
		return this.http.get(`/v2/subscription/products/${productReferenceCode}`)
	}

	/**
	 * List all subscription products with pagination.
	 *
	 * @remarks
	 * Returns a paginated list of all products in your merchant account.
	 * Use `page` and `count` to navigate through results.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.product.list({ page: 1, count: 10 })
	 * if (res.status === 'success') {
	 *   console.log(res.data.totalCount)
	 *   res.data.items.forEach(p => console.log(p.name))
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	async list(params?: SubscriptionProductListParams): Promise<ResponsePaginatedV2<SubscriptionProductData>> {
		return this.http.get(`/v2/subscription/products${buildQueryString(params)}`)
	}

	/**
	 * Delete a subscription product.
	 *
	 * @remarks
	 * A product can only be deleted if it has **no pricing plans** linked to it.
	 * Delete all plans first before removing the product.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.product.delete('prod-ref-001')
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	async delete(productReferenceCode: string): Promise<ResponseBaseV2> {
		return this.http.delete(`/v2/subscription/products/${productReferenceCode}`)
	}
}
