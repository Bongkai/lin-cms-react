module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  plugins: ['@typescript-eslint'],
  extends: ['react-app', 'eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: 0, // 变量可以用下划线
    semi: ['error', 'never'], // 无分号
    'linebreak-style': ['error', 'windows'],
    'no-case-declarations': 0,
    'no-async-promise-executor': 0,
    'no-extra-semi': 0, // 和prettier冲突
  },
}
