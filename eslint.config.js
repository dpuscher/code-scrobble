import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import vitest from "@vitest/eslint-plugin";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { parser as eslintParserTypeScript } from "typescript-eslint";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";

export default defineConfig([
  js.configs.recommended,
  ...nextConfig,
  ...nextTypescript,
  unicorn.configs.recommended,
  {
    extends: [eslintPluginBetterTailwindcss.configs.recommended],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/globals.css",
      },
    },
  },
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
    files: ["**/*.{ts,tsx,cts,mts}"],
    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        project: true,
      },
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "better-tailwindcss/enforce-shorthand-classes": "warn",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  },
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
  prettierConfig,
]);
