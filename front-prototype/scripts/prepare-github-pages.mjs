import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(import.meta.dirname, '../dist')
const indexHtml = resolve(distDir, 'index.html')
const notFoundHtml = resolve(distDir, '404.html')

if (!existsSync(indexHtml)) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log('Created dist/404.html for GitHub Pages SPA routing.')
