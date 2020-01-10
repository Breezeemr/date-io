module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["packages/**/src/**/*"],
  testPathIgnorePatterns: [
    "hijri.test.ts",
    "jalaali.test.ts"
  ],
  globals: {
    'ts-jest': {
      tsConfig: './__tests__/tsconfig.test.json'
    }
  }
};
