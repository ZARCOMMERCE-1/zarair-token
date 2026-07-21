module.exports = {
  root: true,
  env: {
    es2022: true,
    mocha: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: [
    "artifacts",
    "cache",
    "coverage",
    "node_modules",
    "typechain-types",
  ],
};
