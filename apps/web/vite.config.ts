import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
 
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
 
  return {
    plugins: [react()],
 
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // In production the types package won't be present — use the
        // inlined copy we keep in src/lib/sharedTypes.ts instead
        '@dev-sync/types': isProd
          ? path.resolve(__dirname, './src/lib/sharedTypes.ts')
          : path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
    },
 
    // Vite exposes VITE_* env vars to the browser bundle
    // Set VITE_API_URL in Railway to point at your server service
    define: {
      __API_URL__: JSON.stringify(process.env['VITE_API_URL'] ?? ''),
    },
 
    server: {
      port: 5173,
      proxy: {
        '/api': { target: 'http://localhost:4000', changeOrigin: true },
        '/socket.io': { target: 'http://localhost:4000', ws: true },
      },
    },
 
    preview: {
      port: Number(process.env['PORT'] ?? 3000),
      host: '0.0.0.0',
    },
  }
})
