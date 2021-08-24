export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest-setup-env.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
