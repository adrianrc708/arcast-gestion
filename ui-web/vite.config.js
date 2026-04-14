import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['dev.adrianrc.dev'],
    proxy: {
      '/api': 'http://localhost:5001',
      '/ai': 'http://localhost:8001'
    }
  }
})
