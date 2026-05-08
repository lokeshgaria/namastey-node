// eslint.config.mjs
import js from '@eslint/js'
import globals from 'globals'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import unusedImports from 'eslint-plugin-unused-imports'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import nodePlugin from 'eslint-plugin-n'
export default [
  // ── Ignore these folders ─────────────────────────────
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.min.js'],
  },

  // ── Base recommended rules ───────────────────────────
  js.configs.recommended,

  // ── Prettier ─────────────────────────────────────────
  prettierRecommended,

  // ── Main config for all JS files ─────────────────────
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      n: nodePlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node, // process, __dirname, Buffer etc
        ...globals.es2022, // Promise, Map, Set etc
      },
    },
    rules: {
      // ── Unused imports (auto-fix) ────────────────────
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_', // _var = intentionally unused
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ── Import sorting (auto-fix) ────────────────────
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // ── Node.js specific ─────────────────────────────
      'n/no-missing-require': 'error',
      'n/no-unpublished-require': 'off',
      'n/no-unsupported-features/es-syntax': 'off',

      // ── Code quality ─────────────────────────────────
      'no-console': 'warn', // use Winston
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error', // never use var
      'no-var': 'error',
      eqeqeq: ['error', 'always'], // always === not ==
      curly: ['error', 'all'], // always {} in if/else
      'no-unused-vars': 'off', // handled by unused-imports
      'no-undef': 'error',

      // ── Async/await best practices ───────────────────
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'require-await': 'warn', // no async without await

      // ── Security basics ──────────────────────────────
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // ── Prettier ─────────────────────────────────────
      'prettier/prettier': 'error',
    },
  },

  // ── Test files — relaxed rules ────────────────────────
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
      'require-await': 'off',
    },
  },

  // ── Config files — relaxed rules ─────────────────────
  {
    files: ['*.config.js', '*.config.mjs', '.eslintrc.js'],
    rules: {
      'no-undef': 'off',
    },
  },
]
