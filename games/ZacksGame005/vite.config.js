import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api/rooms': {
                target: 'http://127.0.0.1:8787',
                changeOrigin: true
            }
        }
    }
});
