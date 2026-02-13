import type { HttpClient } from '../core/http.js'
import type {
	CardCreateRequest,
	CardCreateResponse,
	CardDeleteRequest,
	CardListRequest,
	CardListResponse,
} from '../types/card-storage.js'
import type { ApiResponse } from '../types/common/api.js'

export class CardStorageResource {
	constructor(private http: HttpClient) {}

	/**
	 * Registers a card for secure storage.
	 *
	 * @remarks
	 * Pass `email` to create a new card user, or `cardUserKey` to add a card
	 * to an existing user. The response includes `cardUserKey` and `cardToken`
	 * which can be used for stored card payments.
	 *
	 * @example
	 * ```ts
	 * // New user
	 * const result = await iyzipay.cardStorage.create({
	 *   email: 'john@example.com',
	 *   card: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', expireYear: '2030', expireMonth: '12' },
	 * })
	 *
	 * // Existing user
	 * const result = await iyzipay.cardStorage.create({
	 *   cardUserKey: 'existing-key',
	 *   card: { cardHolderName: 'John Doe', cardNumber: '5528790000000008', expireYear: '2030', expireMonth: '12' },
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama/kart-saklama-entegrasyonu/kart-kaydetme | Kart Kaydetme}
	 */
	async create(request: CardCreateRequest): Promise<ApiResponse<CardCreateResponse>> {
		return this.http.post('/cardstorage/card', request)
	}

	/**
	 * Lists all stored cards for a user.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.cardStorage.list({
	 *   cardUserKey: 'card-user-key-abc123',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama/kart-saklama-entegrasyonu/kart-listeleme | Kart Listeleme}
	 */
	async list(request: CardListRequest): Promise<ApiResponse<CardListResponse>> {
		return this.http.post('/cardstorage/cards', request)
	}

	/**
	 * Deletes a stored card.
	 *
	 * @example
	 * ```ts
	 * const result = await iyzipay.cardStorage.delete({
	 *   cardUserKey: 'card-user-key-abc123',
	 *   cardToken: 'card-token-xyz789',
	 * })
	 * ```
	 *
	 * @see {@link https://docs.iyzico.com/ek-servisler/kart-saklama/kart-saklama-entegrasyonu/kart-silme | Kart Silme}
	 */
	async delete(request: CardDeleteRequest): Promise<ApiResponse<Record<string, never>>> {
		return this.http.delete('/cardstorage/card', request)
	}
}
