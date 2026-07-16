import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/dl-hero-rand",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    proxy: {
      '/api/discord': {
        target: 'https://discord.com/api/v10',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/discord/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Убираем Origin и Referer, чтобы Discord не блокировал
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            // Ставим корректный User-Agent
            proxyReq.setHeader('User-Agent', 'DiscordBot (dl-hero-rand, 1.0.0)');
          });
        },
      },
    },
  },
});