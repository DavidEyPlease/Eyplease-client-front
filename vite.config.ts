import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { writeFileSync } from "fs"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generate-build-version',
      writeBundle(_, bundle) {
        const outDir = Object.values(bundle)[0]?.fileName ? 'dist' : 'dist'
        writeFileSync(path.resolve(__dirname, outDir, 'build-version.txt'), process.env.VITE_BUILD_ID || 'dev')
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
