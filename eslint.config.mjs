import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, 
      },
    },
    settings: {
      react: {
        version: "detect", 
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Optionnel : utile pour les versions récentes de React
      "react/prop-types": "off", // Optionnel : si vous ne voulez pas forcer les prop-types
    },
  },
];