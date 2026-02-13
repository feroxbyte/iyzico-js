import type { IyzipayOptions } from '../client.js'
import { generateAuthHeader } from '../lib/auth.js'
import { IyzipayConnectionError, IyzipayParseError, IyzipayTimeoutError } from './errors.js'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const DEFAULT_TIMEOUT = 30_000

export class HttpClient {
	private readonly apiKey: string
	private readonly secretKey: string
	private readonly baseUrl: string
	private readonly fetch: typeof globalThis.fetch
	private readonly timeout: number

	constructor(options: IyzipayOptions) {
		this.apiKey = options.apiKey
		this.secretKey = options.secretKey
		this.baseUrl = options.baseUrl.replace(/\/+$/, '')
		this.fetch = options.fetch ?? globalThis.fetch
		this.timeout = options.timeout ?? DEFAULT_TIMEOUT
	}

	async get<T>(path: string): Promise<T> {
		return this.request('GET', path)
	}

	async post<T>(path: string, body?: unknown): Promise<T> {
		return this.request('POST', path, body)
	}

	async put<T>(path: string, body?: unknown): Promise<T> {
		return this.request('PUT', path, body)
	}

	async delete<T>(path: string, body?: unknown): Promise<T> {
		return this.request('DELETE', path, body)
	}

	async patch<T>(path: string, body?: unknown): Promise<T> {
		return this.request('PATCH', path, body)
	}

	private async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
		const init = await this.buildRequestInit(method, path, body)
		const response = await this.send(path, init)
		return this.parse(path, response)
	}

	private async buildRequestInit(method: HttpMethod, path: string, body?: unknown): Promise<RequestInit> {
		const url = this.baseUrl + path
		const jsonBody = body != null ? JSON.stringify(body) : undefined
		const randomKey = generateIyziRnd()
		const uriPath = extractUriPath(url)

		const authorization = await generateAuthHeader(this.apiKey, this.secretKey, randomKey, uriPath, jsonBody)

		const headers: Record<string, string> = {
			Accept: 'application/json',
			Authorization: authorization,
			'x-iyzi-rnd': randomKey,
		}
		if (jsonBody) {
			headers['Content-Type'] = 'application/json'
		}

		return { method, headers, body: jsonBody, signal: AbortSignal.timeout(this.timeout) }
	}

	private async send(path: string, init: RequestInit): Promise<Response> {
		try {
			return await this.fetch(this.baseUrl + path, init)
		} catch (error) {
			if (isTimeoutError(error)) {
				throw new IyzipayTimeoutError(this.timeout, path)
			}
			throw new IyzipayConnectionError(path, error)
		}
	}

	private async parse<T>(path: string, response: Response): Promise<T> {
		let text: string
		try {
			text = await response.text()
		} catch (error) {
			throw new IyzipayConnectionError(path, error)
		}

		try {
			return JSON.parse(text) as T
		} catch (error) {
			throw new IyzipayParseError(response.status, path, text, error)
		}
	}
}

/**
 * Extracts the URI path used for HMAC signing.
 * Looks for `/v2` first (V2 endpoints sign from `/v2` onward),
 * then falls back to the full pathname.
 */
function extractUriPath(url: string): string {
	const v2Index = url.indexOf('/v2')
	if (v2Index !== -1) {
		const queryIndex = url.indexOf('?', v2Index)
		return queryIndex === -1 ? url.slice(v2Index) : url.slice(v2Index, queryIndex)
	}

	const parsed = new URL(url)
	return parsed.pathname
}

function isTimeoutError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'TimeoutError'
}

function generateIyziRnd(): string {
	const array = new Uint32Array(2)
	crypto.getRandomValues(array)
	return `${array[0]}${array[1]}`
}
