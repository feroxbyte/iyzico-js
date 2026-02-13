import { Iyzipay } from '../src/client.js'
import { SANDBOX_OPTIONS } from './helpers.js'

// ─── Mock Client ─────────────────────────────────────────────

export interface CapturedRequest {
	url: string
	init: RequestInit | undefined
}

export function createMockClient(responseBody: Record<string, unknown>, statusCode = 200) {
	const requests: CapturedRequest[] = []

	const mockFetch: typeof globalThis.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : (input as Request).url
		requests.push({ url, init })
		return new Response(JSON.stringify(responseBody), {
			status: statusCode,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const client = new Iyzipay({ ...SANDBOX_OPTIONS, fetch: mockFetch })

	return {
		client,
		requests,
		lastUrl: () => requests.at(-1)!.url,
		lastMethod: () => (requests.at(-1)!.init as RequestInit).method,
		lastBody: () => JSON.parse(requests.at(-1)!.init!.body as string),
		lastHasBody: () => requests.at(-1)!.init!.body != null,
	}
}

// ─── Mock Response Factories ────────────────────────────────

/** Base success response — flat shape used by most iyzico V1 endpoints. */
export function mockSuccessResponse(overrides?: Record<string, unknown>) {
	return {
		status: 'success' as const,
		locale: 'tr',
		systemTime: Date.now(),
		conversationId: '123456789',
		...overrides,
	}
}

/** Data-wrapped success response — used by V2 endpoints (subscription, iyzilink). */
export function mockDataResponse(data: Record<string, unknown>, overrides?: Record<string, unknown>) {
	return {
		status: 'success' as const,
		systemTime: Date.now(),
		data,
		...overrides,
	}
}

/** Paginated data-wrapped response — extends `mockDataResponse` with pagination fields. */
export function mockPaginatedResponse(
	items: Record<string, unknown>[],
	pageOverrides?: Record<string, unknown>,
	overrides?: Record<string, unknown>,
) {
	return mockDataResponse(
		{
			totalCount: items.length,
			currentPage: 1,
			pageCount: 1,
			items,
			...pageOverrides,
		},
		overrides,
	)
}

export function mockErrorResponse(overrides?: {
	errorCode?: string
	errorMessage?: string
	errorGroup?: string
	conversationId?: string
}) {
	return {
		status: 'failure' as const,
		locale: 'tr',
		systemTime: Date.now(),
		errorCode: '10000',
		errorMessage: 'General error',
		errorGroup: 'VALIDATION',
		conversationId: '123456789',
		...overrides,
	}
}
