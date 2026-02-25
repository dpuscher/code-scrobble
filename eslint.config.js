const js = require("@eslint/js");
const prettierConfig = require("eslint-config-prettier/flat");
const nextConfig = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");
const vitestModule = require("@vitest/eslint-plugin");

const vitest = vitestModule.default ?? vitestModule;

module.exports = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".storybook/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "out/**",
      "public/static/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...nextConfig,
  ...nextTypescript,
  {
    files: ["**/*.{spec,test}.{js,jsx,ts,tsx}"],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/no-importing-vitest-globals": "error",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-unresolved": "off",
    },
  },
  prettierConfig,
];
