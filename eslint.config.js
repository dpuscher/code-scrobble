const { FlatCompat } = require('@eslint/eslintrc');
const babelParser = require('@babel/eslint-parser');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**'],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'airbnb',
  ),
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['next/babel'],
        },
      },
      globals: {
        browser: true,
        es6: true,
        node: true,
      },
    },
    rules: {
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/no-unresolved': 'off',
      'jsx-a11y/anchor-is-valid': ['error', {
        components: ['Link'],
        specialLink: ['route'],
        aspects: ['invalidHref', 'preferButton'],
      }],
      'no-unused-vars': ['error', { args: 'none' }],
      'react/destructuring-assignment': 'off',
      'react/forbid-prop-types': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/jsx-one-expression-per-line': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
