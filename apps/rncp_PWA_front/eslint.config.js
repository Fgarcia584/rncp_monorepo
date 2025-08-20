import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        ignores: ['**/*.{test,spec}.{ts,tsx}'], // Exclude test files from main config
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    // Separate configuration for test files
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{test,spec}.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: './tsconfig.test.json',
            },
        },
        rules: {
            // Test-specific rules can be added here
        },
    },
);
