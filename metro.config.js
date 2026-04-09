const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter les extensions WebP au résolveur pour les assets
config.resolver.assetExts.push('webp', 'json');

module.exports = config;

