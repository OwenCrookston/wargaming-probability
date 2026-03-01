/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from /wargaming-probability/ in production
  base: process.env.NODE_ENV === 'production' ? '/wargaming-probability/' : '/',
  test: {
    globals: true,
    environment: 'node',
  },
})
