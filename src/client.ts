import { HttpClient } from './core/http.js'
import { BinResource } from './resources/bin.js'
import { CancelResource } from './resources/cancel.js'
import { CardStorageResource } from './resources/card-storage.js'
import { InstallmentResource } from './resources/installment.js'
import { IyzilinkResource } from './resources/iyzilink.js'
import { MarketplaceNamespace } from './resources/marketplace/index.js'
import { PaymentNamespace } from './resources/payment/index.js'
import { RefundResource } from './resources/refund.js'
import { ReportingResource } from './resources/reporting.js'
import { SubscriptionNamespace } from './resources/subscription/index.js'

/**
 * Configuration options for the iyzico client.
 *
 * @remarks
 * Obtain your `apiKey` and `secretKey` from the
 * {@link https://merchant.iyzipay.com | iyzico merchant panel}.
 * Use `https://api.iyzipay.com` for production or `https://sandbox-api.iyzipay.com`
 * for the sandbox environment.
 */
export interface IyzipayOptions {
	/** Your iyzico API key from the merchant panel. */
	apiKey: string
	/** Your iyzico secret key from the merchant panel. */
	secretKey: string
	/** Base URL — `https://sandbox-api.iyzipay.com` (sandbox) or `https://api.iyzipay.com` (production). */
	baseUrl: string
	/** Optional custom fetch — useful for testing, polyfills, or Cloudflare Workers. */
	fetch?: typeof globalThis.fetch
	/** Request timeout in milliseconds. @default 30_000 */
	timeout?: number
}

/**
 * iyzico payment SDK client — the main entry point for all API operations.
 *
 * @remarks
 * Create an `Iyzipay` instance with your credentials, then access payment flows
 * and operations through the namespace properties:
 *
 * - `payment` — Non-3DS, 3DS, Checkout Form, Pay with iyzico, pre/post-auth
 * - `marketplace` — sub-merchant management and basket-item approval
 * - `subscription` — products, pricing plans, and recurring payment lifecycle
 * - `refund` — item-based (V1) and amount-based (V2) refunds
 * - `cancel` — same-day full payment cancellation (void)
 * - `bin` — BIN (Bank Identification Number) lookup
 * - `installment` — installment plan query
 * - `iyzilink` — payment link (iyzilink / fastlink) management
 * - `cardStorage` — register, list, and delete stored cards for one-click payments
 *
 * @example
 * ```ts
 * import { Iyzipay } from 'iyzico-js'
 *
 * const iyzipay = new Iyzipay({
 *   apiKey: 'sandbox-...',
 *   secretKey: 'sandbox-...',
 *   baseUrl: 'https://sandbox-api.iyzipay.com',
 * })
 *
 * const result = await iyzipay.payment.create({ ... })
 * ```
 *
 * @see https://docs.iyzico.com
 */
export class Iyzipay {
	private readonly http: HttpClient

	/**
	 * Payment operations — Non-3DS, 3D Secure, Checkout Form, and Pay with iyzico.
	 *
	 * @remarks
	 * iyzico supports four payment flows depending on your integration needs:
	 *
	 * - **Non-3DS** — direct card payment without bank verification (`create`, `retrieve`)
	 * - **3D Secure** — card payment with SMS/OTP verification (`threeds.initialize` → `threeds.create`)
	 * - **Checkout Form** — iyzico-hosted payment page (`checkoutForm.initialize` → `checkoutForm.retrieve`)
	 * - **Pay with iyzico** — redirect to iyzico wallet (`payWithIyzico.initialize` → `payWithIyzico.retrieve`)
	 *
	 * Non-3DS and 3DS also support **pre-authorization**: reserve funds first with `createPreAuth()`
	 * (or `threeds.initializePreAuth()`), then capture later with `createPostAuth()`.
	 *
	 * @see {@link https://docs.iyzico.com/on-hazirliklar/api-reference-beta/odeme-metotlari | Ödeme Metotları}
	 */
	readonly payment: PaymentNamespace
	/**
	 * Marketplace operations — sub-merchant management and basket-item approval.
	 *
	 * @remarks
	 * The iyzico marketplace model enables platforms to accept payments on behalf of
	 * multiple sellers (sub-merchants). Funds are split per basket item and held in
	 * escrow until the platform explicitly approves payout.
	 *
	 * - `subMerchant` — register, update, and query sub-merchant accounts
	 * - `approval` — approve or disapprove basket items to release/hold escrowed funds
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu | Pazaryeri Entegrasyonu}
	 */
	readonly marketplace: MarketplaceNamespace
	/**
	 * Subscription operations — products, pricing plans, customers, and subscription lifecycle.
	 *
	 * @remarks
	 * The iyzico subscription API follows a **Product → Pricing Plan → Subscription** hierarchy.
	 * Products group related plans, plans define pricing and billing intervals, and subscriptions
	 * bind a customer to a plan for recurring payments.
	 *
	 * - `product` — create, update, list, retrieve, and delete subscription products
	 * - `pricingPlan` — create, update, list, retrieve, and delete pricing plans for a product
	 * - `customer` — retrieve, update, and list subscription customers (subscribers)
	 * - Direct methods — initialize, activate, cancel, upgrade, retry, search subscriptions
	 *
	 *  * @see {@link https://docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu | Abonelik Entegrasyonu}
	 */
	readonly subscription: SubscriptionNamespace
	/**
	 * Refund operations — item-based (V1), amount-based (V2), and merchant-charged refunds.
	 *
	 * @remarks
	 * Unlike {@link CancelResource | cancel} (same-day void), a refund can be issued
	 * **up to 365 days** after the original payment and supports **partial amounts**.
	 *
	 * iyzico offers two refund models:
	 * - **Item-based (V1)** — refund a specific basket item by its `paymentTransactionId`.
	 * - **Amount-based (V2)** — refund an arbitrary amount from the payment by `paymentId`,
	 *   without specifying individual items.
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/iptal-ve-iade | İptal ve İade }
	 */
	readonly refund: RefundResource
	/**
	 * Same-day full payment cancellation (void).
	 *
	 * @remarks
	 * A cancel is a **full reversal** of a payment made on the **same day** — the transaction
	 * is voided before settlement and never appears on the cardholder's statement.
	 *
	 * - Only available on the **same calendar day** as the original payment.
	 * - Always cancels the **full amount** — partial cancellation is not supported.
	 * - For next-day or partial returns, use {@link RefundResource} instead.
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/iptal-ve-iade | İptal ve İade }
	 */
	readonly cancel: CancelResource
	/**
	 * BIN (Bank Identification Number) lookup.
	 *
	 * @remarks
	 * Use this to identify the card type, association, bank, and program before
	 * processing a payment. Helps determine installment eligibility and display
	 * card branding in the checkout UI.
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/taksit-ve-bin-sorgulama| Taksit ve BIN Sorgulama }
	 */
	readonly bin: BinResource
	/**
	 * Installment plan lookup.
	 *
	 * @remarks
	 * Query available installment options for a given price and (optionally) a
	 * specific card BIN. Use this to display installment tables in the checkout UI
	 * before the customer submits payment.
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/taksit-ve-bin-sorgulama| Taksit ve BIN Sorgulama }
	 */
	readonly installment: InstallmentResource
	/**
	 * iyzilink (payment link) operations — create, list, update, and delete payment links.
	 *
	 * @remarks
	 * iyzilink lets merchants generate shareable payment links without any integration.
	 * Supports standard links (with product image) and fast links (price-only).
	 *
	 * @see {@link https://docs.iyzico.com/urunler/link-ile-odeme | Link ile Ödeme}
	 */
	readonly iyzilink: IyzilinkResource
	/**
	 * Card storage operations — register, list, and delete stored payment cards.
	 *
	 * @remarks
	 * Securely store card details on iyzico's PCI-compliant infrastructure for
	 * one-click checkout. After registering a card, use the returned `cardUserKey`
	 * and `cardToken` in payment requests (`paymentCard` field) instead of raw
	 * card details.
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama | Kart Saklama}
	 */
	readonly cardStorage: CardStorageResource
	/**
	 * Reporting operations — payment details and daily transaction queries.
	 *
	 * @remarks
	 * The reporting service returns the current status of payments, refund results,
	 * and fraud statuses. Two endpoints are available:
	 *
	 * - `getPaymentDetails` — query by `paymentId` or `paymentConversationId`
	 * - `getDailyTransactions` — paginated list of all transactions on a given date
	 *
	 * @see {@link https://docs.iyzico.com/en/advanced/reporting-service | Reporting Service}
	 */
	readonly reporting: ReportingResource

	constructor(options: IyzipayOptions) {
		this.http = new HttpClient(options)
		this.payment = new PaymentNamespace(this.http)
		this.marketplace = new MarketplaceNamespace(this.http)
		this.subscription = new SubscriptionNamespace(this.http)
		this.refund = new RefundResource(this.http)
		this.cancel = new CancelResource(this.http)
		this.bin = new BinResource(this.http)
		this.installment = new InstallmentResource(this.http)
		this.iyzilink = new IyzilinkResource(this.http)
		this.cardStorage = new CardStorageResource(this.http)
		this.reporting = new ReportingResource(this.http)
	}
}
