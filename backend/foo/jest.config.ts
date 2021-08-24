export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest-setup-env.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
