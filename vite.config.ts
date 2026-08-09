import path from "path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Keep hook-based libraries on the same React runtime as the app.
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // The editor is lazy-loaded, so pre-bundle it with React at startup instead
    // of letting Vite discover and optimize it after edit mode is opened.
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tiptap/react",
      "@tiptap/react/menus",
      "@tiptap/starter-kit",
      "@tiptap/extension-text-style",
    ],
  },
});
