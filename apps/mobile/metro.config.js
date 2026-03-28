const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Merge monorepo root into watchFolders (keeping defaults)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Merge monorepo node_modules into resolution paths (keeping defaults)
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Resolve @jobsy/shared from source so Metro can bundle it directly
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@jobsy/shared") {
    return {
      filePath: path.resolve(monorepoRoot, "packages/shared/src/index.ts"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
