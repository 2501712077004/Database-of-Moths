import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/moths': 'http://localhost:8000',
      '/proteins': 'http://localhost:8000',
      '/search': 'http://localhost:8000'
    }
  }
})
