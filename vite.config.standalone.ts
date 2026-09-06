/**
 * Configuration Vite/TanStack AUTONOME (sans aucun paquet Lovable).
 *
 * Utilisée pour héberger l'application en dehors de Lovable :
 *   npm run build:standalone
 *   npm run dev:standalone
 *
 * `vite.config.ts` reste basé sur le paquet d'outillage de l'éditeur Lovable
 * (aperçu, HMR sandbox). Les deux configurations produisent la même
 * application : mêmes plugins, même entrée serveur `src/server.ts`.
 */
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { host: "::", port: 8080 },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
  ],
});
