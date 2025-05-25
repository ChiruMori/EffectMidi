const { defineConfig, globalIgnores } = require('eslint/config')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

module.exports = defineConfig([
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      '@electron-toolkit/eslint-config-ts/recommended',
      '@electron-toolkit/eslint-config-prettier'
    ),

    settings: {
      react: {
        version: 'detect'
      }
    },

    languageOptions: {
      parserOptions: {
        // 消除版本不支持警告（TS 版本过高时会报）
        warnOnUnsupportedTypeScriptVersion: false
      }
    },

    rules: {
      // 禁用重复枚举误报
      '@typescript-eslint/no-duplicate-enum-values': 'off'
    }
  },
  // 忽略文件
  globalIgnores(['**/node_modules', '**/dist', '**/out', '**/.gitignore', '**/eslint.config.cjs'])
])
