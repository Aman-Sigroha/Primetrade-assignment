import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    hookTimeout: 120_000,
    testTimeout: 60_000,
    fileParallelism: false,
    passWithNoTests: true,
  },
});
