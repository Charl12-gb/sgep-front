module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    "no-unused-vars": "warn",
    "no-empty": "warn",
    "vue/no-use-v-if-with-v-for": "warn",
    "vue/multi-word-component-names": "off",
    "vue/no-ref-as-operand": "warn",
  },
}
