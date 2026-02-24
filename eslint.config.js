const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const prettierConfig = require("eslint-config-prettier/flat");
const vitestModule = require("@vitest/eslint-plugin");

const vitest = vitestModule.default ?? vitestModule;

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

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
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
  ),
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
