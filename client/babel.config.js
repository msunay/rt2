process.env.EXPO_ROUTER_APP_ROOT = "../../src/app"; // allows use of /src/app

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
    ],
  };
};
