module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "detect" } },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // A handful of links (social placeholders with no real URL yet, the
    // home page's "Read more" buttons that don't have a destination yet)
    // intentionally use href="javascript:void(0)", matching the original
    // static site's convention for not-yet-implemented links.
    "jsx-a11y/anchor-is-valid": "off",
  },
  ignorePatterns: ["dist", "HTML", "node_modules"],
};
