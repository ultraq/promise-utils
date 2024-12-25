/**
 * @type {import('jest').Config}
 */
export default {
	collectCoverage: true,
	coverageReporters: [
		'html',
		'lcov',
		'text-summary'
	]
};
