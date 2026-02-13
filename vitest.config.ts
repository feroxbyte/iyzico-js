import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		exclude: ['tests/integration/**', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			include: ['src/**'],
			exclude: ['src/types/**', 'src/index.ts'],
			reporter: ['text', 'json', 'json-summary'],
			thresholds: {
				statements: 95,
				branches: 85,
				functions: 95,
				lines: 95,
			},
		},
	},
})
