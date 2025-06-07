// Import the app.json config
const appConfig = require('./app.json');

// Export the config with additional web-specific settings
module.exports = {
  ...appConfig,
  expo: {
    ...appConfig.expo,
    web: {
      ...appConfig.expo.web,
      bundler: "metro",
      // Ensure proper routing for Expo Router
      router: {
        origin: "/",
      },
      // Configure the build output
      output: "static",
      // Add a custom splash screen for web
      favicon: "./assets/images/applogo.png",
      // Ensure proper asset paths in production
      publicPath: "/",
    },
    // Make sure the expo-router plugin is available
    plugins: [
      ...appConfig.expo.plugins || [],
      "expo-router"
    ],
    // Extra configuration for client-side routing
    extra: {
      ...appConfig.expo.extra || {},
      router: {
        origin: false
      },
      eas: appConfig.expo.extra?.eas
    }
  }
};
