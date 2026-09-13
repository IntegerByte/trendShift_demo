import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deploying to a sub-folder on Apache/XAMPP (e.g. htdocs/CMS-trendShift/)?
// Set base to that sub-path (e.g. "/CMS-trendShift/") and update
// RewriteBase in public/.htaccess to match before running `npm run build`.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
    // Split the largest third-party dependency into its own cacheable chunk
    // instead of bundling it with app code that changes far more often.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
