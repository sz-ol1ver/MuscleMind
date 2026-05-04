module.exports = {
    projects: [
        {
            displayName: 'backend',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/backend/tests/**/*.test.js']
        },
        {
            displayName: 'frontend',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/frontend/tests/**/*.test.js']
        }
    ],
    coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/tests/']
};
