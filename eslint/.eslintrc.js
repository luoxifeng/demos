module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    // parser: '@typescript-eslint/parser',
    "parser": {
      "ts": "@typescript-eslint/parser",
      "<template>": "espree"
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    // project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  },
  plugins: [
    'vue',
    '@a/eslint-plugin'
  ],
  rules: {
    '@a/no-alert1': 2
    // "vue/block-lang": ["error",
    //   {
    //     "script": {
    //       "lang": "ts"
    //     }
    //   }
    // ]
  }
}
