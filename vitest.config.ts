import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts?(x)'],
    alias: {
      // server-only throws in jsdom; no-op it for tests
      'server-only': new URL('./tests/mocks/server-only.ts', import.meta.url).pathname,
    },
  },
});
