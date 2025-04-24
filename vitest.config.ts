import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      enabled: true,
      exclude: ["commitlint.config.js", ...coverageConfigDefaults.exclude],
    },
  },
});
