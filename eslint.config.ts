import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    {
        languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    },
    {
        // Note: there should be no other properties in this object
        ignores: [
            'coverage',
            '**/public',
            '**/dist',
            'pnpm-lock.yaml',
            'pnpm-workspace.yaml',
            '**/pwa-assets.config.ts',
        ],
    },
    {
        files: ['apps/rncp_PWA_front/**/*.{ts,tsx}'],
        settings: { react: { version: '18.3' } },
        languageOptions: {
            // other options...
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json', './tsconfig.test.json', './vitest.config.ts'],
                tsconfigRootDir: './apps/rncp_PWA_front',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
];
