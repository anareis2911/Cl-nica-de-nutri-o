import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      js: pluginJs,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
    },
  },
];
