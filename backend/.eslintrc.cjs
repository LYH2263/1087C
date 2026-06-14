const baseConfig = require('../.eslintrc.base.cjs')

module.exports = {
  ...baseConfig,
  root: true,
  env: {
    ...baseConfig.env,
    node: true,
    commonjs: true,
    es2022: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  rules: {
    ...baseConfig.rules,
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  },
  globals: {
    jest: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly'
  }
}
