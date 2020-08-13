const path = require("path");

module.exports = {
  coverageDirectory: "coverage",
  coverageReporters: ["text", "clover", "html"],
  collectCoverageFrom: [
    "**/src/**/*.{ts,tsx}",
    "!**/node_modules/**",
  ],
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  automock: false,
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js", ".jsx", "json"],
  notify: true,
  notifyMode: "always",
  testMatch: [
    "**/(src|test|tests)/**/*.test.+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.[t|j]sx?$": ["ts-jest", { rootMode: "upward" }],
  },
};
