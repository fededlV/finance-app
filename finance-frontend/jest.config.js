module.exports = {
  preset: "jest-expo",
  clearMocks: true,
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
};
