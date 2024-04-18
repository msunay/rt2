// import babelParser from "@babel/eslint-parser";
const react = require('eslint-plugin-react');

const stylistic =  require('@stylistic/eslint-plugin')
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  stylistic.configs.customize({
    semi: true,
    braceStyle: '1tbs',

  }),
  {
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      "@stylistic/linebreak-style": ["error", "unix"],
      '@stylistic/type-generic-spacing': ["error"],
      // '@stylistic/indent-binary-ops': ["error", 2],
      '@stylistic/type-named-tuple-spacing': ["error"],
      '@stylistic/no-multiple-empty-lines': ["error", { "max": 2 }],
      '@stylistic/operator-linebreak': ["error", "after", { "overrides": { "?": "before", ":": "before" } }],
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
        parser: tseslint.parser
      }
    },
    {
      ignores: ['babel.config.js', '.expo/**']
    }
];