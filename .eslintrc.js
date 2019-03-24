module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "extends": ["eslint:recommended", "plugin:react/recommended", "airbnb"],
  "plugins": ["react"],
  "parser": "babel-eslint",
  "rules": {
    "import/extensions": "off",
    "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
    "import/no-unresolved": "off",
    "jsx-a11y/anchor-is-valid": ["error", {
      "components": ["Link"],
      "specialLink": ["route"],
      "aspects": ["invalidHref", "preferButton"],
    }],
    "no-unused-vars": ["error", { "args": "none" }],
    "react/destructuring-assignment": "off",
    "react/forbid-prop-types": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/jsx-one-expression-per-line": "off",
    "react/react-in-jsx-scope": "off",
  }
};
