module.exports = {
  extends: "standard",
  installedESLint: true,
  plugins: [
    "standard",
    "promise"
  ],
  env: {
    'browser': true
  },
  rules: {
    eqeqeq: "off",
    // http://eslint.cn/docs/rules/semi
    semi: ["error", "always"],
    // http://eslint.cn/docs/rules/curly
    curly: "error",
    // http://eslint.cn/docs/rules/radix
    radix: "error",
    'one-var': ['error', 'never'],
    'newline-after-var': ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    'max-len': ["error", 80]
  }
};
