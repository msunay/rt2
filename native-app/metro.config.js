// metro.config.js

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
// const resolveFrom = require("resolve-from"); // We won't use resolveFrom anymore
const path = require("path"); // Import the 'path' module

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Define the path fragment to identify react-native-webrtc reliably
// Adjust this if your pnpm structure places it differently, but this is common
const RN_WEBRTC_PATH_FRAGMENT = path.join('node_modules', 'react-native-webrtc');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    // If the bundle is resolving "event-target-shim" (or anything starting with it)
    moduleName.startsWith("event-target-shim") &&
    // And the request originates from a module within react-native-webrtc's path
    context.originModulePath.includes(RN_WEBRTC_PATH_FRAGMENT)
  ) {
    try {
      // Use require.resolve to find the main entry point of 'event-target-shim'.
      // The 'paths' option tells it to start searching from the directory
      // containing the module that required it (context.originModulePath).
      // This ensures it finds the v6 shim associated with react-native-webrtc
      // and respects the "exports" map in its package.json correctly.
      const resolvedPath = require.resolve(
        "event-target-shim", // <-- Resolve the base package name, not moduleName directly
        { paths: [path.dirname(context.originModulePath)] } // Start search from the requiring file's directory
      );

      return {
        filePath: resolvedPath,
        type: "sourceFile",
      };
    } catch (err) {
      console.error(
        `Metro config failed to resolve 'event-target-shim' from webrtc context: ${err.message}`
      );
      // Fall through to default resolver if our custom logic fails spectacularly
    }
  }

  // Ensure you call the default resolver for all other cases.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
