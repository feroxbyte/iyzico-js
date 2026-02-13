import type { HttpClient } from '../../core/http.js'
import { buildQueryString } from '../../lib/query-string.js'
import type { ApiResponse } from '../../types/common/api.js'
import type { ResponseBaseV2, ResponsePaginatedV2, ResponseV2 } from '../../types/common/v2.js'
import type {
	SubscriptionCardUpdateData,
	SubscriptionCheckoutFormData,
	SubscriptionDetailItem,
	SubscriptionInitializeData,
	SubscriptionUpgradeData,
} from '../../types/subscription/index.js'
import type {
	SubscriptionCardUpdateRequest,
	SubscriptionCheckoutFormInitializeRequest,
	SubscriptionInitializeRequest,
	SubscriptionInitializeWithCustomerRequest,
	SubscriptionRetryRequest,
	SubscriptionSearchParams,
	SubscriptionUpgradeRequest,
} from '../../types/subscription/subscription.js'
import { SubscriptionCustomerResource } from './customer.js'
import { SubscriptionPricingPlanResource } from './pricing-plan.js'
import { SubscriptionProductResource } from './product.js'

export class SubscriptionNamespace {
	/**
	 * Subscription product management.
	 *
	 * @remarks
	 * Products are the top-level grouping in the iyzico subscription hierarchy.
	 * Each product can have multiple pricing plans, and each plan can have multiple
	 * subscribers. Product names must be unique within your merchant account.
	 *
	 * A product can only be deleted if it has no pricing plans linked to it.
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-urunu | iyzico Abonelik Ürünü}
	 */
	readonly product: SubscriptionProductResource
	/**
	 * Subscription pricing plan management.
	 *
	 * @remarks
	 * Pricing plans define billing terms (price, interval, currency, recurrence)
	 * within a product. Each plan belongs to exactly one product.
	 *
	 * - `paymentIntervalCount` is a frequency multiplier (e.g. `2` + `WEEKLY` = every 2 weeks)
	 * - `recurrenceCount` omitted or `0` means billing continues indefinitely until canceled
	 * - `trialPeriodDays` delays the first charge by the given number of days
	 * - Only `name` and `trialPeriodDays` can be updated after creation
	 * - Plans with active subscriptions cannot be deleted
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/odeme-plani | iyzico Ödeme Planı}
	 */
	readonly pricingPlan: SubscriptionPricingPlanResource
	/**
	 * Subscription customer (subscriber / abone) management.
	 *
	 * @remarks
	 * Customers are automatically created when a subscription is initialized.
	 * This resource lets you retrieve, update, and list those subscriber records.
	 *
	 * A customer is uniquely identified by their `customerReferenceCode`, which is
	 * returned during subscription initialization and can be used across all
	 * subscription endpoints.
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abone-islemleri | Abonelik Entegrasyonu}
	 */
	readonly customer: SubscriptionCustomerResource

	constructor(private http: HttpClient) {
		this.product = new SubscriptionProductResource(http)
		this.pricingPlan = new SubscriptionPricingPlanResource(http)
		this.customer = new SubscriptionCustomerResource(http)
	}

	// ─── Subscription initialization ────────────────────────────

	/**
	 * Initialize a subscription via direct API (NON-3DS) with a new customer.
	 *
	 * @remarks
	 * Creates both the customer and subscription in a single call. The customer
	 * is auto-registered using the provided identity fields (email + GSM).
	 * Only credit cards are accepted — debit cards and stored cards are not supported.
	 *
	 * Set `subscriptionInitialStatus` to `'PENDING'` to delay activation until
	 * {@link activate} is called explicitly. `'ACTIVE'` starts billing immediately
	 * (or after the trial period, if the plan has one).
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.initialize({
	 *   pricingPlanReferenceCode: 'plan-ref-001',
	 *   subscriptionInitialStatus: 'ACTIVE',
	 *   customer: { name: 'John', surname: 'Doe', email: 'john@example.com', ... },
	 *   paymentCard: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', ... },
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-initialize | Abonelik Başlatma (NON3D) }
	 */
	async initialize(request: SubscriptionInitializeRequest): Promise<ResponseV2<SubscriptionInitializeData>> {
		return this.http.post('/v2/subscription/initialize', request)
	}

	/**
	 * Initialize a subscription for an existing customer (NON-3DS).
	 *
	 * @remarks
	 * The customer must already have at least one active subscription — their
	 * stored card from the previous subscription is reused. Use the
	 * `customerReferenceCode` returned during the original subscription creation.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.initializeWithCustomer({
	 *   pricingPlanReferenceCode: 'plan-ref-002',
	 *   subscriptionInitialStatus: 'ACTIVE',
	 *   customerReferenceCode: 'cust-ref-001',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-initialize-with-customer | Abonelik Başlatma (Existing Customer) }
	 */
	async initializeWithCustomer(
		request: SubscriptionInitializeWithCustomerRequest,
	): Promise<ResponseV2<SubscriptionInitializeData>> {
		return this.http.post('/v2/subscription/initialize/with-customer', request)
	}

	/**
	 * Initialize a subscription via the iyzico Checkout Form.
	 *
	 * @remarks
	 * Returns an HTML form that handles card input and 3D Secure authentication
	 * on the iyzico side. The form token expires after approximately 300 seconds.
	 * After the customer completes payment, iyzico posts the result to your
	 * `callbackUrl`.
	 *
	 * This is the recommended flow for PCI compliance — card data never touches
	 * your server.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.initializeWithCf({
	 *   callbackUrl: 'https://merchant.com/callback',
	 *   pricingPlanReferenceCode: 'plan-ref-001',
	 *   subscriptionInitialStatus: 'ACTIVE',
	 *   customer: { name: 'John', surname: 'Doe', email: 'john@example.com', ... },
	 * })
	 * if (res.status === 'success') {
	 *   // Render res.checkoutFormContent in your page
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-checkoutform-initialize | Abonelik Başlatma (iyzico Ödeme Formu) }
	 */
	async initializeWithCf(
		request: SubscriptionCheckoutFormInitializeRequest,
	): Promise<ApiResponse<SubscriptionCheckoutFormData>> {
		return this.http.post('/v2/subscription/checkoutform/initialize', request)
	}

	/**
	 * Retrieve the result of a subscription Checkout Form after the customer completes payment.
	 *
	 * @remarks
	 * After {@link initializeWithCf} returns a form and the customer completes it,
	 * iyzico posts to your `callbackUrl`. Use the `token` from the initialize response
	 * to query the subscription creation result.
	 *
	 * @example
	 * ```ts
	 * // In your callback handler:
	 * const res = await iyzipay.subscription.retrieveCfResult('checkout-token-123')
	 * if (res.status === 'success') {
	 *   console.log(res.data.referenceCode) // new subscription ref
	 *   console.log(res.data.customerReferenceCode)
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#get-v2-subscription-checkoutform-token | Abonelik Checkout Form Sorgulama }
	 */
	async retrieveCfResult(token: string): Promise<ResponseV2<SubscriptionInitializeData>> {
		return this.http.get(`/v2/subscription/checkoutform/${token}`)
	}

	// ─── Subscription queries ───────────────────────────────────

	/**
	 * Retrieve a subscription's full details including billing periods and payment attempts.
	 *
	 * @remarks
	 * Returns the subscription record along with its orders (billing periods)
	 * and each order's payment attempts. Use this to inspect the complete
	 * billing history of a subscription.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.retrieve('sub-ref-001')
	 * if (res.status === 'success') {
	 *   const sub = res.data.items[0]
	 *   console.log(sub.subscriptionStatus, sub.orders.length)
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#get-v2-subscription-subscriptions-subscriptionreferencecode | Abonelik Detayı }
	 */
	async retrieve(subscriptionReferenceCode: string): Promise<ResponseV2<SubscriptionDetailItem>> {
		return this.http.get(`/v2/subscription/subscriptions/${subscriptionReferenceCode}`)
	}

	/**
	 * Search and list subscriptions with optional filters and pagination.
	 *
	 * @remarks
	 * Returns a paginated list of subscriptions. Supports filtering by status,
	 * customer, pricing plan, parent reference code, and date range. When no
	 * params are provided, returns all subscriptions.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.search({
	 *   subscriptionStatus: 'ACTIVE',
	 *   page: 1,
	 *   count: 10,
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#get-v2-subscription-subscriptions | Abonelik Arama }
	 */
	async search(params?: SubscriptionSearchParams): Promise<ResponsePaginatedV2<SubscriptionDetailItem>> {
		return this.http.get(`/v2/subscription/subscriptions${buildQueryString(params)}`)
	}

	// ─── Subscription lifecycle ─────────────────────────────────

	/**
	 * Activate a pending subscription.
	 *
	 * @remarks
	 * Only applies to subscriptions created with `subscriptionInitialStatus: 'PENDING'`.
	 * Once activated, the subscription begins its billing cycle (or trial period)
	 * and this action is irreversible — the subscription cannot be returned to PENDING.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.activate('sub-ref-001')
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-subscriptions-subscriptionreferencecode-activate | Abonelik Aktifleştirme }
	 */
	async activate(subscriptionReferenceCode: string): Promise<ResponseBaseV2> {
		return this.http.post(`/v2/subscription/subscriptions/${subscriptionReferenceCode}/activate`)
	}

	/**
	 * Cancel an active subscription.
	 *
	 * @remarks
	 * Stops all future billing for the subscription. The subscription status
	 * becomes `'CANCELED'`. Already-charged periods are not refunded — use the
	 * refund API separately if needed.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.cancel('sub-ref-001')
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-subscriptions-subscriptionreferencecode-cancel | Abonelik İptali }
	 */
	async cancel(subscriptionReferenceCode: string): Promise<ResponseBaseV2> {
		return this.http.post(`/v2/subscription/subscriptions/${subscriptionReferenceCode}/cancel`)
	}

	/**
	 * Upgrade (or change) a subscription to a different pricing plan.
	 *
	 * @remarks
	 * The new plan must belong to the **same product** and have the **same billing
	 * interval** (e.g. both MONTHLY). Use `upgradePeriod: 'NOW'` to apply
	 * immediately or `'NEXT_PERIOD'` to take effect at the next billing cycle.
	 *
	 * The original subscription is marked as `'UPGRADED'` and a new subscription
	 * reference code is returned.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.upgrade('sub-ref-001', {
	 *   newPricingPlanReferenceCode: 'plan-ref-002',
	 *   upgradePeriod: 'NOW',
	 * })
	 * if (res.status === 'success') {
	 *   console.log(res.data.referenceCode) // new subscription ref
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-subscriptions-subscriptionreferencecode-upgrade | Abonelik Yükseltme }
	 */
	async upgrade(
		subscriptionReferenceCode: string,
		request: SubscriptionUpgradeRequest,
	): Promise<ResponseV2<SubscriptionUpgradeData>> {
		return this.http.post(`/v2/subscription/subscriptions/${subscriptionReferenceCode}/upgrade`, request)
	}

	/**
	 * Retry a failed subscription payment for a specific billing period.
	 *
	 * @remarks
	 * When a subscription payment fails (order status `'FAILED'`), you can retry
	 * the charge using the `orderReferenceCode` from the failed period. The
	 * customer's stored card is charged again.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.subscription.retryPayment({
	 *   referenceCode: 'order-ref-001', // from the failed order
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-operation-retry | Abonelik Ödeme Tekrarlama }
	 */
	async retryPayment(request: SubscriptionRetryRequest): Promise<ResponseBaseV2> {
		return this.http.post('/v2/subscription/operation/retry', request)
	}

	// ─── Card update ────────────────────────────────────────────

	/**
	 * Initialize a card update via the iyzico Checkout Form.
	 *
	 * @remarks
	 * Available only for subscriptions created through the Checkout Form flow.
	 * A 1 TRY validation charge is made to verify the new card, which is
	 * immediately refunded. After the customer completes the form, the result
	 * is posted to your `callbackUrl`.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.subscription.initializeCardUpdate({
	 *   callbackUrl: 'https://merchant.com/card-update',
	 *   customerReferenceCode: 'cust-ref-001',
	 * })
	 * if (res.status === 'success') {
	 *   // Render res.checkoutFormContent in your page
	 * }
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu/abonelik-islemleri#post-v2-subscription-card-update-checkoutform-initialize | Abonelik Kart Güncelleme (Checkout Form) }
	 */
	async initializeCardUpdate(request: SubscriptionCardUpdateRequest): Promise<ApiResponse<SubscriptionCardUpdateData>> {
		return this.http.post('/v2/subscription/card-update/checkoutform/initialize', request)
	}
}
