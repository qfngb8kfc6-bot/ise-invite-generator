import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'out/**',
    'dist/**',
    'build/**',
    'archives/**',
    '**/*.backup.ts',
    '**/*.backup.tsx',
    '**/*.before-*.ts',
    '**/*.before-*.tsx',
  ]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
])

export default eslintConfig
