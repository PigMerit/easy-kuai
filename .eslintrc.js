module.exports = {
    root: true,
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        '@ks/eslint-config-ks',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/essential',
    ],
    rules: {
        'template-curly-spacing': 'off',
        'no-undefined': 'off',
        'no-extra-parens': 'off',
        semi: 'off',
        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-extra-parens': ['error'],
    },
    globals: {
        EASY_ENV_IS_PROD: true,
        EASY_ENV_IS_NODE: true,
        EASY_ENV_IS_BROWSER: true,
    },
};
