/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons", "require", "default"]
  },
  setupFiles: ["<rootDir>/jest.polyfill.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|mjs|ts|tsx)$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(rettime|headers-polyfill|@open-draft|@inquirer|until-async)/).*"
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js"
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,jsx}", "<rootDir>/pages/**/*.test.{js,jsx}"],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 60,
      branches: 65
    }
  }
};

module.exports = config;
