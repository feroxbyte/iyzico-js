import type { HttpClient } from '../../core/http.js'
import { ApprovalResource } from './approval.js'
import { SubMerchantResource } from './sub-merchant.js'

export class MarketplaceNamespace {
	/**
	 * Sub-merchant management for the iyzico marketplace model.
	 *
	 * @remarks
	 * Before accepting payments on behalf of sellers, each seller must be registered as a
	 * sub-merchant. iyzico supports three sub-merchant types based on legal entity:
	 *
	 * - **Personal** (`PERSONAL_SUB_MERCHANT_TYPE`) — individual sellers (identity number required)
	 * - **Private Company** (`PRIVATE_SUB_MERCHANT_TYPE`) — sole proprietorships (tax number required)
	 * - **Limited/Joint Stock** (`LIMITED_OR_JOINT_STOCK_COMPANY_SUB_MERCHANT_TYPE`) — corporations (tax office + IBAN must match company title)
	 *
	 * The `subMerchantKey` returned from `create()` must be stored — it is used as
	 * `subMerchantKey` in basket items when creating marketplace payments.
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/alt-uye-olusturma | Alt Üye Oluşturma}
	 */
	readonly subMerchant: SubMerchantResource
	/**
	 * Marketplace basket-item approval for payout release.
	 *
	 * @remarks
	 * In the iyzico marketplace model, funds from a payment are held **in escrow** until
	 * the merchant explicitly approves each basket item. This gives the merchant control
	 * over when sub-merchants receive their payout.
	 *
	 * - `approve()` — releases the escrowed funds for a basket item to the sub-merchant.
	 * - `disapprove()` — re-holds previously approved funds (e.g., if the item is returned).
	 *
	 * Approval is code-level only — there is no approval UI in the iyzico merchant panel.

	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/onay | Onay }
	 */
	readonly approval: ApprovalResource

	constructor(http: HttpClient) {
		this.subMerchant = new SubMerchantResource(http)
		this.approval = new ApprovalResource(http)
	}
}
