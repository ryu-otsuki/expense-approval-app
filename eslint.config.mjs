import nuxt from '@nuxt/eslint-config'

export default [
  ...nuxt(),
  {
    rules: {
      'no-console': 'off',
    },
  },
]
