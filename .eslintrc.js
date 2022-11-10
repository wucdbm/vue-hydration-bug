module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:jsonc/recommended-with-json',
        '@vue/eslint-config-typescript',
    ],
    parserOptions: {
        ecmaVersion: 2021,
        parser: '@typescript-eslint/parser',
        sourceType: 'module'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'multiline-ternary': ['off', 'never'],
        'no-constant-condition': 'off',
        'no-unreachable': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        '@typescript-eslint/no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        quotes: [process.env.NODE_ENV === 'production' ? 'error' : 'warn', 'single'],
        'vue/multi-word-component-names': ['off'],
        'vue/no-v-html': 'error',
        'vue/no-reserved-props': ['error', {
            'vueVersion': 2,
        }],
        'vue/html-indent': [
            'error',
            4,
            {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: []
            }
        ],
        'vue/html-self-closing': ['error', {
            'html': {
                'void': 'never',
                'normal': 'never',
                'component': 'always'
            },
            'svg': 'always',
            'math': 'always'
        }],
        'vue/script-indent': [
            'error',
            4,
            {
                baseIndent: 0,
                switchCase: 1,
                ignores: []
            }
        ],
        'vue/max-attributes-per-line': [
            'error',
            {
                'singleline': {
                    'max': 1
                },
                'multiline': {
                    'max': 1
                }
            }
        ],
        'vue/first-attribute-linebreak': [
            'error',
            {
                'singleline': 'ignore'
            }
        ],
        'vue/no-template-shadow': ['error'],
        'vue/require-default-prop': ['error'],
        'vue/v-on-event-hyphenation': ['error'],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/indent': ['error', 4],
    },
    plugins: ['vue', '@typescript-eslint'],
    overrides: [
        {
            files: ['*.ts', '*.vue'],
            rules: {
                'no-undef': 'off'
            }
        },
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            env: {
                jest: true
            }
        }
    ],
    ignorePatterns: ['server.js', 'server/*', 'tsconfig-server.json']
}
