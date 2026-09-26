import { resolve } from "node:path";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: { rollupOptions: { input: resolve("src/main/main.ts") } },
  },
  preload: {
    build: { rollupOptions: { input: resolve("src/main/preload.ts") } },
  },
  renderer: {
    root: resolve("src/renderer"),
    publicDir: resolve("models"),
    base: "./",
    server: { host: "127.0.0.1" },
    build: { rollupOptions: { input: resolve("src/renderer/index.html") } },
  },
});
