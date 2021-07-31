module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["@typescript-eslint", "jest"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-implicit-any-catch": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-unused-vars": "off",
    "no-redeclare": "off",
    "no-duplicate-imports": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-redeclare": "error",
    "@typescript-eslint/no-duplicate-imports": "error",
  },
  env: {
    node: true,
    es2020: true,
    "jest/globals": true,
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },
};
