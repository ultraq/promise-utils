import myConfig from 'eslint-config-ultraq';
import globals from 'globals';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
	...myConfig,
	{
		ignores: [
			'promise-utils.cjs.js',
			'promise-utils.d.cts',
			'promise-utils.d.ts'
		]
	},
	{
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.jest,
				...globals.node
			}
		},
		rules: {
			'jsdoc/require-jsdoc': ['error', {
				publicOnly: true
			}]
		}
	}
];
