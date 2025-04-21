import process from 'node:process'
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'antfu/if-newline': 'off',
    },
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    ignores: [
      'tests/*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'n/prefer-global/process': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style'],
      }],
      'vue/component-name-in-template-casing': ['error', 'kebab-case', {
        registeredComponentsOnly: true,
        ignores: [],
      }],
    },
  },
)
