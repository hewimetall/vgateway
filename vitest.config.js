import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.js'],
      thresholds: {
        lines: 93,
        functions: 93,
        statements: 93,
        branches: 93
      }
    }
  }
});
