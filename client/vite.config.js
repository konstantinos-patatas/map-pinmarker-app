// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/client/', // 👈 critical for correct asset loading in production
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});