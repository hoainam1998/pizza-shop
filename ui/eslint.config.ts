import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  {
    rules: {
      semi: 'error',
      'max-len': [2, 120, 2],
      'no-console': 'off',
      'react/jsx-props-no-spreading': 'off',
      'prefer-promise-reject-errors': 'off',
      camelcase: 'error',
      'no-unused-vars': ['error', { args: 'none' }],
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-use-before-define': [
        'off',
        {
          variables: true,
        },
      ],
      'valid-typeof': 'error',
      quotes: ['error', 'single'],
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
);
