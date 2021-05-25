module.exports = {
  bail: false,
  verbose: false,
  collectCoverage: false,
  coverageDirectory: "./coverage/",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$"
};
