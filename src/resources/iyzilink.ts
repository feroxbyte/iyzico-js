import type { HttpClient } from '../core/http.js'
import { buildQueryString } from '../lib/query-string.js'
import type { ResponseBaseV2, ResponseV2 } from '../types/common/v2.js'
import type {
	IyzilinkCreateOrUpdateData,
	IyzilinkCreateRequest,
	IyzilinkFastLinkCreateRequest,
	IyzilinkListData,
	IyzilinkListParams,
	IyzilinkProduct,
	IyzilinkProductStatus,
	IyzilinkQueryParams,
	IyzilinkUpdateRequest,
} from '../types/iyzilink.js'

export class IyzilinkResource {
	constructor(private http: HttpClient) {}

	/**
	 * Create a new iyzilink payment link.
	 *
	 * @remarks
	 * Creates a standard payment link with a product image. The `encodedImageFile`
	 * field must contain a base64-encoded image (PNG/JPG). Returns a token and the
	 * shareable payment URL.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.iyzilink.create({
	 *   name: 'Premium Widget',
	 *   description: 'High-quality widget',
	 *   price: '100.0',
	 *   currencyCode: 'TRY',
	 *   encodedImageFile: 'iVBORw0KGgo...', // base64 PNG
	 * })
	 * if (res.status === 'success') {
	 *   console.log(res.data.url) // shareable payment link
	 * }
	 * ```
	 */
	async create(request: IyzilinkCreateRequest): Promise<ResponseV2<IyzilinkCreateOrUpdateData>> {
		return this.http.post('/v2/iyzilink/products', request)
	}

	/**
	 * Create a fast link (quick payment link without image).
	 *
	 * @remarks
	 * Simplified link creation — requires only price and currency. No product image
	 * is needed. The merchant must have at least one approved standard iyzilink.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.iyzilink.createFastLink({
	 *   price: '50.0',
	 *   currencyCode: 'TRY',
	 * })
	 * ```
	 */
	async createFastLink(request: IyzilinkFastLinkCreateRequest): Promise<ResponseV2<IyzilinkCreateOrUpdateData>> {
		return this.http.post('/v2/iyzilink/fast-link/products', request)
	}

	/**
	 * List all iyzilink products with pagination.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.iyzilink.list({ page: 1, count: 10 })
	 * if (res.status === 'success') {
	 *   console.log(res.data.totalCount)
	 *   res.data.items.forEach(p => console.log(p.name, p.url))
	 * }
	 * ```
	 */
	async list(params?: IyzilinkListParams): Promise<ResponseV2<IyzilinkListData>> {
		return this.http.get(`/v2/iyzilink/products${buildQueryString(params)}`)
	}

	/**
	 * Retrieve a single iyzilink product by token.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.iyzilink.retrieve('product-token-123')
	 * if (res.status === 'success') {
	 *   console.log(res.data.name, res.data.price)
	 * }
	 * ```
	 */
	async retrieve(token: string, params?: IyzilinkQueryParams): Promise<ResponseV2<IyzilinkProduct>> {
		return this.http.get(`/v2/iyzilink/products/${token}${buildQueryString(params)}`)
	}

	/**
	 * Update an existing iyzilink product.
	 *
	 * @example
	 * ```ts
	 * const res = await iyzipay.iyzilink.update('product-token-123', {
	 *   name: 'Updated Widget',
	 *   description: 'Now even better',
	 *   price: '120.0',
	 *   currencyCode: 'TRY',
	 * })
	 * ```
	 */
	async update(token: string, request: IyzilinkUpdateRequest): Promise<ResponseV2<IyzilinkCreateOrUpdateData>> {
		return this.http.put(`/v2/iyzilink/products/${token}`, request)
	}

	/**
	 * Update the status of an iyzilink product (activate/deactivate).
	 *
	 * @example
	 * ```ts
	 * await iyzipay.iyzilink.updateStatus('product-token-123', 'PASSIVE')
	 * ```
	 */
	async updateStatus(
		token: string,
		status: IyzilinkProductStatus,
		params?: IyzilinkQueryParams,
	): Promise<ResponseBaseV2> {
		return this.http.patch(`/v2/iyzilink/products/${token}/status/${status}${buildQueryString(params)}`)
	}

	/**
	 * Delete an iyzilink product.
	 *
	 * @example
	 * ```ts
	 * await iyzipay.iyzilink.delete('product-token-123')
	 * ```
	 */
	async delete(token: string, params?: IyzilinkQueryParams): Promise<ResponseBaseV2> {
		return this.http.delete(`/v2/iyzilink/products/${token}${buildQueryString(params)}`)
	}
}
