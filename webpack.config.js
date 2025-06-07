const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@ui-kitten/components',
          '@react-native-async-storage/async-storage'
        ]
      }
    }, 
    argv
  );
  
  // Add polyfills for AsyncStorage and other modules
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-get-random-values': 'get-random-values',
    crypto: require.resolve('crypto-browserify'),
  };

  // Fix public path for deployed assets
  if (env.mode === 'production') {
    config.output.publicPath = '/';
  }

  // Add fallbacks for browser polyfills
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
  
  // Configure the webpack server to handle SPA routing
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true, // This is the key configuration for client-side routing
    };
  }

  return config;
};
