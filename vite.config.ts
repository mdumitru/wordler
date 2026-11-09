/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    // Same output directory as Create React App, which deploy/ expects.
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    // Node 25+ ships its own localStorage global, which hides jsdom's.
    execArgv: ["--no-experimental-webstorage"],
  },
});
