import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  // グローバル除外パターン
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.d.ts"],
  },

  // JavaScript推奨ルール
  eslint.configs.recommended,

  // TypeScript推奨ルール（型情報あり）
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 共通設定
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["packages/*/src/*.test.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // 既存コードとの互換性のため緩和
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/restrict-plus-operands": "warn",
    },
  },

  // テストファイル用の設定
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-base-to-string": "off",
    },
  },

  // Prettier競合回避（最後に配置）
  eslintConfigPrettier
);
