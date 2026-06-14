const baseConfig = require('../.eslintrc.base.cjs')

module.exports = {
  ...baseConfig,
  root: true,
  env: {
    ...baseConfig.env,
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    ...baseConfig.rules,
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  }
}
