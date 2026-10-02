import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "public/sw.js",
      "public/swe-worker-*.js",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
