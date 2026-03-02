import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // listen on all interfaces (IPv4 + IPv6)
    port: 5173,
    strictPort: true,
    open: true,        // auto-open browser on start
  },
})
