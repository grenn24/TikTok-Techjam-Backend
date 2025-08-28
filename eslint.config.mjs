import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import imports from 'eslint-plugin-import';
import node from "eslint-plugin-node"
import unusedImports from 'eslint-plugin-unused-imports'
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: ["dist/**"],
        languageOptions: {
            globals: globals.browser
        },
        plugins: {
            import: imports,
            'unused-imports': unusedImports,
            "node": node
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "import/order": [
                "warn",
                {
                    "groups": ["builtin", "external", "internal"],
                    "alphabetize": { "order": "asc", "caseInsensitive": true },
                    "newlines-between": "never"
                }
            ],
            "unused-imports/no-unused-imports": "warn",
            "no-multiple-empty-lines": ["warn", {
                max: 1,
                maxEOF: 0,
                maxBOF: 0
            }],
            "node/file-extension-in-import": [
                "error",
                "never",
            ],
        }
    },

]);