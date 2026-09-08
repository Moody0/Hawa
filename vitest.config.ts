import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'e2e/**', 'tests/order-concurrency-and-inventory.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://isolated-test-user:mock-password@127.0.0.1:5432/hawa_isolated_test_db',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
