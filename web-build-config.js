const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-native-async-storage/async-storage'
        ]
      }
    }, 
    argv
  );
  
  // Add a condition to check for window before using it
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
  };

  // Fix for SSR rendering issues
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
  };

  // Configure historyApiFallback for client-side routing
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
    };
  }

  return config;
};
