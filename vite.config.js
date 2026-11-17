import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative paths: the build works in any folder (e.g. username.github.io/<repo-name>/)
  base: './',
  plugins: [tailwindcss()],
})
