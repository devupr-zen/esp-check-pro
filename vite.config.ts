import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "/",                                // ensure correct asset paths on Vercel/custom domains
  server: { host: "::", port: 8080 },       // local dev (ok as-is)
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { sourcemap: true, chunkSizeWarningLimit: 1500 }, // dist is default
}));
