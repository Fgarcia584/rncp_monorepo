// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    moduleNameMapper: {
        '^@rncp/types(.*)$': '<rootDir>/../../../tools/types$1',
    },
    testTimeout: 10000,
};
