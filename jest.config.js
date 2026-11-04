module.exports = {
  preset: '@react-native/jest-preset',
  // a cold cache (every CI run) makes the first render of a list or scroll view slow
  testTimeout: 15000,
  // react navigation is published as es modules only. the preset skips node_modules,
  // so @react-navigation has to be added or Jest stops at "Unexpected token 'export'"
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)',
  ],
};
