import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - separate chunk for React ecosystem
          'vendor-react': [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          
          // Material-UI - large UI library
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          
          // Charts - likely the largest contributor
          'vendor-charts': [
            '@mui/x-charts'
          ],
          
          // Form handling and validation
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // HTTP and data fetching
          'vendor-http': [
            '@tanstack/react-query',
            'axios'
          ],
          
          // Analytics and utilities
          'vendor-utils': [
            '@vercel/analytics'
          ]
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 600, // Slightly higher limit for vendor chunks
  }
})
