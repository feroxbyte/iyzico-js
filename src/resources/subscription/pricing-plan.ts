import type { HttpClient } from '../../core/http.js'
import { buildQueryString } from '../../lib/query-string.js'
import type { ResponseBaseV2, ResponsePaginatedV2, ResponseV2 } from '../../types/common/v2.js'
import type { PricingPlanData } from '../../types/subscription/index.js'
import type {
	PricingPlanCreateRequest,
	PricingPlanListParams,
	PricingPlanUpdateRequest,
} from '../../types/subscription/pricing-plan.js'

export class SubscriptionPricingPlanResource {
	constructor(private http: HttpClient) {}

	/**
	 * Create a pricing plan for a subscription product.
	 *
	 * @remarks
	 * The plan is created under the specified product. Set `recurrenceCount` to
	 * limit billing cycles, or omit it for indefinite billing. Use `trialPeriodDays`
	 * to offer a free trial before the first charge.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.pricingPlan.create('prod-ref-001', {
	 *   name: 'Monthly Plan',
	 *   price: 49.99,
	 *   currencyCode: 'TRY',
	 *   paymentInterval: 'MONTHLY',
	 *   planPaymentType: 'RECURRING',
	 *   recurrenceCount: 12,
	 *   trialPeriodDays: 7,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani#post-v2-subscription-products-productreferencecode-pricing-plans | Ödeme Planı Oluşturma }
	 */
	async create(productReferenceCode: string, request: PricingPlanCreateRequest): Promise<ResponseV2<PricingPlanData>> {
		return this.http.post(`/v2/subscription/products/${productReferenceCode}/pricing-plans`, request)
	}

	/**
	 * Update a pricing plan's name and/or trial period.
	 *
	 * @remarks
	 * Only `name` and `trialPeriodDays` can be modified after creation.
	 * Price, currency, interval, and recurrence count are immutable once set.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.pricingPlan.update('plan-ref-001', {
	 *   name: 'Monthly Plan (Updated)',
	 *   trialPeriodDays: 14,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani#post-v2-subscription-pricing-plans-pricingplanreferencecode | Ödeme Planı Güncelleme }
	 */
	async update(
		pricingPlanReferenceCode: string,
		request: PricingPlanUpdateRequest,
	): Promise<ResponseV2<PricingPlanData>> {
		return this.http.post(`/v2/subscription/pricing-plans/${pricingPlanReferenceCode}`, request)
	}

	/**
	 * Retrieve a pricing plan by reference code.
	 *
	 * @remarks
	 * Returns the full plan details including price, interval, currency,
	 * recurrence count, and trial period.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.pricingPlan.retrieve('plan-ref-001')
	 * if (res.status === 'success') {
	 *   console.log(res.data.price, res.data.paymentInterval)
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani#get-v2-subscription-pricing-plans-pricingplanreferencecode | Ödeme Planı Detayı Alma }
	 */
	async retrieve(pricingPlanReferenceCode: string): Promise<ResponseV2<PricingPlanData>> {
		return this.http.get(`/v2/subscription/pricing-plans/${pricingPlanReferenceCode}`)
	}

	/**
	 * List all pricing plans for a product with pagination.
	 *
	 * @remarks
	 * Returns a paginated list of pricing plans under the specified product.
	 * Use `page` and `count` to navigate through results.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.pricingPlan.list('prod-ref-001', {
	 *   page: 1,
	 *   count: 10,
	 * })
	 * if (res.status === 'success') {
	 *   res.data.items.forEach(plan => console.log(plan.name, plan.price))
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani#get-v2-subscription-products-productreferencecode-pricing-plans | Ödeme Planı Listeleme }
	 */
	async list(
		productReferenceCode: string,
		params?: PricingPlanListParams,
	): Promise<ResponsePaginatedV2<PricingPlanData>> {
		return this.http.get(`/v2/subscription/products/${productReferenceCode}/pricing-plans${buildQueryString(params)}`)
	}

	/**
	 * Delete a pricing plan.
	 *
	 * @remarks
	 * A pricing plan can only be deleted if it has **no active subscriptions**.
	 * Cancel all subscriptions linked to this plan before attempting deletion.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.pricingPlan.delete('plan-ref-001')
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani#delete-v2-subscription-pricing-plans-pricingplanreferencecode | Ödeme Planı Silme }
	 */
	async delete(pricingPlanReferenceCode: string): Promise<ResponseBaseV2> {
		return this.http.delete(`/v2/subscription/pricing-plans/${pricingPlanReferenceCode}`)
	}
}
