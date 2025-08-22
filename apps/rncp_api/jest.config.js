// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    moduleNameMapper: {
        '^@rncp/types(.*)$': '<rootDir>/../../../tools/types$1',
    },
    moduleDirectories: ['node_modules', '<rootDir>'],
    setupFilesAfterEnv: [],
    testTimeout: 10000,
};
