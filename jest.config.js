module.exports = {
  preset: '@react-native/jest-preset',
  // a cold cache (every CI run) makes the first render of a list or scroll view slow
  testTimeout: 15000,
};
