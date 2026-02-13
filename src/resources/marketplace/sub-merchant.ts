import type { HttpClient } from '../../core/http.js'
import type { ApiResponse } from '../../types/common/api.js'
import type {
	ItemPayoutUpdateRequest,
	ItemPayoutUpdateResponse,
	SubMerchantCreateRequest,
	SubMerchantCreateResponse,
	SubMerchantRetrieveRequest,
	SubMerchantRetrieveResponse,
	SubMerchantUpdateRequest,
} from '../../types/marketplace.js'

export class SubMerchantResource {
	constructor(private http: HttpClient) {}

	/**
	 * Registers a new sub-merchant and returns a `subMerchantKey`.
	 *
	 * @remarks
	 * The returned `subMerchantKey` is the permanent identifier for this sub-merchant
	 * and must be stored in your system. You'll pass it in `basketItems[].subMerchantKey`
	 * when creating marketplace payments.
	 *
	 * For limited/joint-stock companies, the IBAN account holder name must match the
	 * registered company title exactly.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.marketplace.subMerchant.create({
	 *   subMerchantExternalId: 'seller-42',
	 *   subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY_SUB_MERCHANT_TYPE',
	 *   legalCompanyTitle: 'Acme Ltd.',
	 *   taxOffice: 'Istanbul',
	 *   taxNumber: '1234567890',
	 *   iban: 'TR760006200119000006672315',
	 *   address: 'Nidakule Göztepe, Istanbul',
	 *   email: 'seller@acme.com',
	 * })
	 * const subMerchantKey = result.subMerchantKey // store this!
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/alt-uye-olusturma | Alt Üye Oluşturma}
	 */
	async create(request: SubMerchantCreateRequest): Promise<ApiResponse<SubMerchantCreateResponse>> {
		return this.http.post('/onboarding/submerchant', request)
	}

	/**
	 * Updates an existing sub-merchant's details.
	 *
	 * @remarks
	 * Use this to update address, IBAN, contact info, or other registration details.
	 * The sub-merchant is identified by `subMerchantKey` in the request body.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.marketplace.subMerchant.update({
	 *   subMerchantKey: 'xYz123...',
	 *   iban: 'TR760006200119000006672315',
	 *   address: 'New address, Istanbul',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/alt-uye-olusturma/alt-uye-guncelleme | Alt Üye Güncelleme}
	 */
	async update(request: SubMerchantUpdateRequest): Promise<ApiResponse<Record<string, never>>> {
		return this.http.put('/onboarding/submerchant', request)
	}

	/**
	 * Retrieves sub-merchant details by `subMerchantExternalId`.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.marketplace.subMerchant.retrieve({
	 *   subMerchantExternalId: 'seller-42',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/alt-uye-olusturma/alt-uye-sorgulama | Alt Üye Sorgulama}
	 */
	async retrieve(request: SubMerchantRetrieveRequest): Promise<ApiResponse<SubMerchantRetrieveResponse>> {
		return this.http.post('/onboarding/submerchant/detail', request)
	}

	/**
	 * Updates the payout breakdown for a specific basket item after payment.
	 *
	 * @remarks
	 * Allows changing the sub-merchant payout amount for an individual basket item
	 * after the payment has been created. The `paymentTransactionId` identifies the
	 * specific item within the payment.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.marketplace.subMerchant.updatePayoutItem({
	 *   subMerchantKey: 'xYz123...',
	 *   paymentTransactionId: '22334455',
	 *   subMerchantPrice: '85.0',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/urunler/pazaryeri/pazaryeri-entegrasyonu/alt-uye-olusturma/alt-uye-urun-guncelleme | Alt Üye Ürün Güncelleme}
	 */
	async updatePayoutItem(request: ItemPayoutUpdateRequest): Promise<ApiResponse<ItemPayoutUpdateResponse>> {
		return this.http.put('/payment/item', request)
	}
}
