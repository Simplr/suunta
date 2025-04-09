import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const config = defineConfig({
    plugins: [
        //
        tailwindcss(),
    ],
    build: {
        minify: false,
    },
    server: {
        host: true,
        port: 8000,
        watch: {
            usePolling: true,
        },
    },
});

export default config;
