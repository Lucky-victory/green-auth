module.exports = {
  // Specify the test environment
  testEnvironment: "node",

  // Specify file extensions for test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

  // Specify file extensions Jest should look for
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Configure code coverage collection
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],

  // Setup files to run before tests
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Transform files before running tests
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // Module name mapper for aliases or non-JS modules
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Configure Jest to work with ESM
  extensionsToTreatAsEsm: [".ts"],
};
