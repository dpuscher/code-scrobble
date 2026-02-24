import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./config/setupTests.ts'],
    include: ['**/*.{spec,test}.{js,jsx,ts,tsx}'],
    exclude: ['.next/**', 'node_modules/**'],
    coverage: {
      include: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: ['lib/colors.js', 'lib/polyfills.js'],
    },
  },
});
