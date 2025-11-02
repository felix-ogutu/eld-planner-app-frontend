// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],

    server: {
        port: 3000,
        proxy: {
            // Proxy API requests to Django backend
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
            // Proxy media files (PDFs, images)
            '/media': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },

    base: '/',
})