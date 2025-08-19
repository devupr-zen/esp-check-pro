// eslint.config.js
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", ".vercel", ".next"] },

  // Type-aware rules for our code (point to tsconfig.eslint.json)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname
      },
      globals: globals.browser
    },
    plugins: { react, "react-hooks": hooks },
    settings: { react: { version: "detect" } },
    rules: {
      // React
      ...hooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "off",      // keep MVP velocity
      "@typescript-eslint/no-empty-object-type": "off", // shadcn sometimes trips this
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Style
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  },

  // Turn OFF type-aware parsing for huge vendor-style files if needed (example)
  {
    files: ["src/components/ui/**"], // shadcn
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "react-refresh/only-export-components": "off"
    }
  }
);
