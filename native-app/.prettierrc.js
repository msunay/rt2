/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: "es5",
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 120,
    plugins: ["prettier-plugin-organize-imports"]
  };

module.exports = config;
