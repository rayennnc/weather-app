// in-memory stand-in for AsyncStorage. the real package needs the native
// module and ships as ES modules, which Jest does not handle here.
// Jest uses this file by itself: it sits next to node_modules
const databases = new Map();

function createAsyncStorage(name) {
  if (!databases.has(name)) {
    const data = new Map();
    databases.set(name, {
      getItem: async key => data.get(key) ?? null,
      setItem: async (key, value) => {
        data.set(key, value);
      },
      removeItem: async key => {
        data.delete(key);
      },
      clear: async () => {
        data.clear();
      },
    });
  }
  return databases.get(name);
}

module.exports = {
  __esModule: true,
  createAsyncStorage,
  default: createAsyncStorage('legacy'),
};
