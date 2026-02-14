# Contributing to iyzico-js

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- **Node.js 20+** (uses `fetch` and Web Crypto natively)
- **[pnpm](https://pnpm.io/)** — package manager

## Setup

```bash
git clone https://github.com/feroxbyte/iyzico-js.git
cd iyzico-js
pnpm install
```

## Project Architecture

```
src/
├── types/                        # Request + response interfaces (one file per domain)
│   ├── common/                   # Enums, base types, shared sub-objects (Buyer, Address, …)
│   └── payment/, cancel.ts, …   # Domain-specific request + response pairs
├── resources/                    # Resource classes that call the HTTP client
│   ├── payment/                  # PaymentNamespace (Non-3DS, 3DS, Checkout Form, Pay with iyzico)
│   ├── marketplace/              # MarketplaceNamespace (sub-merchants, approval)
│   └── cancel.ts, refund.ts, …  # Flat resources
├── core/http.ts                  # Fetch-based HTTP client with HMAC-SHA256 auth signing
├── lib/                          # Standalone utilities (auth, crypto)
├── client.ts                     # Iyzipay class — wires all resources together
└── index.ts                      # Public API barrel export
```

**Request flow:** `Iyzipay` → resource class → `HttpClient.post()` → HMAC-SHA256 auth header → `fetch` → parsed JSON.

**Key conventions:**

- Types are **interfaces**, not classes — zero runtime overhead.
- Resources take `HttpClient` in the constructor and expose async methods.
- API errors are **returned, not thrown** — check `result.status === 'success'` vs `'failure'`.
- All crypto uses **Web Crypto API** (`crypto.subtle`) — never `node:crypto`.
- Namespaces can be nested: `iyzipay.payment.threeds.initialize(req)`.

## Development Workflow

```bash
pnpm check          # Type-check (src + test tsconfigs)
pnpm lint            # Lint with Biome
pnpm lint:fix        # Auto-fix lint issues
pnpm test            # Run unit tests (vitest)
pnpm test:watch      # Unit tests in watch mode
pnpm build           # Build ESM output (tsdown)
```

Run a single test file:

```bash
pnpm test -- tests/unit/cancel.test.ts
```

**Before every commit**, run:

```bash
pnpm check && pnpm lint && pnpm test
```

### Integration Tests

Integration tests hit the iyzico sandbox API and require network access:

```bash
pnpm test:integration
```

Sandbox credentials are in `tests/helpers.ts`. These are iyzico's public sandbox keys — no secrets to configure.

## Adding a New Resource

This is the most common type of contribution. Follow this recipe:

### 1. Define types in `src/types/`

Create `src/types/<domain>.ts` with request and response interfaces:

```ts
import type { BaseRequest } from './common/api.js'

// ─── Request types ───────────────────────────────────────────────

export interface ExampleCreateRequest extends BaseRequest {
  /** Required field */
  someId: string
  /** Optional field */
  ip?: string
}

// ─── Response types ──────────────────────────────────────────────

export interface ExampleResponse {
  someId: string
  price: number
  currency: string
}
```

Then re-export from `src/types/index.ts`.

### 2. Create the resource class in `src/resources/`

Create `src/resources/<domain>.ts`:

```ts
import type { HttpClient } from '../core/http.js'
import type { ExampleCreateRequest, ExampleResponse } from '../types/<domain>.js'
import type { ApiResponse } from '../types/common/api.js'

export class ExampleResource {
  constructor(private http: HttpClient) {}

  async create(request: ExampleCreateRequest): Promise<ApiResponse<ExampleResponse>> {
    return this.http.post('/payment/example', request)
  }
}
```

### 3. Wire it into the client

In `src/client.ts`, import the resource and add it to the `Iyzipay` class:

```ts
readonly example: ExampleResource

// in constructor:
this.example = new ExampleResource(this.http)
```

### 4. Export publicly

Add the new types to `src/index.ts`.

### 5. Write unit tests

Create `tests/unit/<domain>.test.ts`. Unit tests mock `fetch` via `createMockClient()`:

```ts
import { describe, expect, it } from 'vitest'
import { createMockClient, mockSuccessResponse, mockErrorResponse } from '../test-utils.js'

function mockExampleResponse(overrides?: Record<string, unknown>) {
  return mockSuccessResponse({
    someId: '12345',
    price: 1.1,
    currency: 'TRY',
    ...overrides,
  })
}

describe('example.create', () => {
  it('should POST to the correct endpoint', async () => {
    const { client, lastUrl, lastBody } = createMockClient(mockExampleResponse())

    await client.example.create({ someId: '12345', ip: '85.34.78.112' })

    expect(lastUrl()).toBe('https://sandbox-api.iyzipay.com/payment/example')
    expect(lastBody().someId).toBe('12345')
  })

  it('should return data on success', async () => {
    const { client } = createMockClient(mockExampleResponse())
    const res = await client.example.create({ someId: '12345' })

    expect(res.status).toBe('success')
    if (res.status === 'success') {
      expect(res.price).toBe(1.1)
    }
  })

  it('should return error response on failure', async () => {
    const { client } = createMockClient(
      mockErrorResponse({ errorCode: '10000', errorMessage: 'General error' }),
    )
    const res = await client.example.create({ someId: 'bad' })

    expect(res.status).toBe('failure')
  })
})
```

### 6. Write integration tests (optional)

If the endpoint is available in iyzico's sandbox, add `tests/integration/<domain>.test.ts`. Use the helpers from `tests/helpers.ts` (`buildBuyer()`, `buildPaymentCard()`, etc.) to build realistic request payloads.

## Testing Patterns

### Mock utilities (`tests/test-utils.ts`)

| Helper                      | Use for                                  |
| --------------------------- | ---------------------------------------- |
| `createMockClient(body)`    | Creates an `Iyzipay` instance with a mocked `fetch` that returns `body` |
| `mockSuccessResponse()`     | Flat V1 success shape (`status`, `locale`, `systemTime`) |
| `mockDataResponse(data)`    | V2 data-wrapped shape (`status`, `data: { … }`)         |
| `mockPaginatedResponse(items)` | V2 paginated shape (adds `totalCount`, `currentPage`)  |
| `mockErrorResponse()`       | Failure shape with `errorCode` and `errorMessage`        |

### Integration helpers (`tests/helpers.ts`)

Pre-built request factories: `buildPaymentRequest()`, `buildBuyer()`, `buildAddress()`, `buildPaymentCard()`, `buildBasketItems()`, etc. Use these instead of hand-crafting payloads.

## Code Style

This project uses **[Biome](https://biomejs.dev/)** for formatting and linting. Run `pnpm lint:fix` to auto-format. Key rules:

- **Tabs** for indentation, **120** character line width
- **Single quotes**, ASI (no semicolons unless required)
- **ESM imports** with `.js` extensions (even for `.ts` files)
- **`import type`** for type-only imports (`verbatimModuleSyntax` is enabled)
- **No `console.*`** calls (enforced by Biome, except in `examples/`)
- **No Node-specific APIs** in `src/` — no `require()`, no `node:crypto`

## Common Pitfalls

- **Price strings must keep at least one decimal:** `"1"` → `"1.0"`, `"1.10"` → `"1.1"`.
- **Auth functions take pre-serialized JSON:** `JSON.stringify("body")` produces `'"body"'`, not `"body"`.
- **Never use `node:crypto`** — everything goes through Web Crypto (`crypto.subtle`).
- **All imports need `.js` extensions** — TypeScript won't add them for you.

## Pull Requests

- Use **conventional commit** format for PR titles: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- All CI checks must pass (`pnpm check && pnpm lint && pnpm test`).
- Describe **what** changed and **why** in the PR description.
- Keep changes focused — one concern per PR.
- Add or update tests for any new or changed behavior.

## Code of Conduct

This project follows the [Contributor Covenant 3.0](CODE_OF_CONDUCT.md). Please read it before participating.

## Questions?

Open an issue on the [issue tracker](https://github.com/feroxbyte/iyzico-js/issues).
