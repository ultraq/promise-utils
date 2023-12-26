/** @type {import('jest').Config} */
const config = {
	collectCoverage: true,
	coverageReporters: [
		'html',
		'lcov',
		'text-summary'
	]
};

export default config;
