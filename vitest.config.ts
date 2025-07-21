import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'src/index.ts',
      'tests/**',
      '**/*.d.ts',
      'node_modules/**'
    ],
    thresholds: {
      global: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      },
      'src/lib/': {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95
      },
      'src/services/': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      },
      'src/presenters/': {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      },
      'src/command/': {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})