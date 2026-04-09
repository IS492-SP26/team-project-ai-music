const path = require('path')
const { defineConfig } = require('vitest/config')

const root = __dirname

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': root,
    },
  },
})
