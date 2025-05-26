import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local'
    }
  },
  server: {
    // 👇 This is the key line
    historyApiFallback: true
  }
})
