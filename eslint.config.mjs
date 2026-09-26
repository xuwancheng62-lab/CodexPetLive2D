import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "out/**",
      "node_modules/**",
      "models/**",
      "CubismWebSamples-*/**",
      "CubismSdkForWeb-*/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
