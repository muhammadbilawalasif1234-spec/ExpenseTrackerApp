const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Map lucide-react to lucide-react-native to prevent missing module errors
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "lucide-react": require.resolve("lucide-react-native"),
};

module.exports = config;
