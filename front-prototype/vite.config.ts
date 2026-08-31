import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project site uses /repo-name/ as base; local dev uses /.
const pagesBase = process.env.GITHUB_PAGES_BASE?.trim()

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase && pagesBase.length > 0 ? pagesBase : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
