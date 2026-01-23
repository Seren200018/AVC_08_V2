import { defineConfig } from "vite";

export default defineConfig({
  // For GitHub Pages set VITE_BASE="/<repo>/" (workflow does this automatically).
  base: process.env.VITE_BASE || "/",
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
      },
    },
  },
});
