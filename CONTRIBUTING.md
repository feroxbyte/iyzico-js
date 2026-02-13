# Contributing to iyzico-js

Thanks for your interest in contributing!

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)

## Setup

```bash
git clone https://github.com/feroxbyte/iyzico-js.git
cd iyzico-js
pnpm install
```

## Development Workflow

```bash
pnpm check        # Type-check (both src and test tsconfigs)
pnpm lint          # Lint with Biome
pnpm lint:fix      # Auto-fix lint issues
pnpm test          # Run unit tests
pnpm build         # Build ESM output
```

Run all checks before pushing:

```bash
pnpm check && pnpm lint && pnpm test
```

## Pull Requests

- Use **conventional commit** format for PR titles: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, etc.
- All CI checks must pass.
- Describe **what** changed and **why** in the PR description.
- Keep changes focused — one concern per PR.

## Code Style

This project uses [Biome](https://biomejs.dev/) for formatting and linting. Run `pnpm lint:fix` to auto-format before committing. Key rules:

- Tabs for indentation, 120 character line width
- Single quotes, ASI (no semicolons)
- ESM imports with `.js` extensions
- `import type` for type-only imports

## Questions?

Open an issue on the [issue tracker](https://github.com/feroxbyte/iyzico-js/issues).
