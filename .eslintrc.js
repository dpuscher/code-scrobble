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
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "no-unused-vars": ["error", { "args": "none" }],
    "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
    "jsx-a11y/anchor-is-valid": ["error", {
        "components": ["Link"],
        "specialLink": ["route"],
        "aspects": ["invalidHref", "preferButton"],
    }],
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/forbid-prop-types": "off",
  }
};
