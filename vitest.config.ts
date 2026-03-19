import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    setupFiles: ['./tests/integration/helpers/setup.ts'],
    fileParallelism: false,
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});