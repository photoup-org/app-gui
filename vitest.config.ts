import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'], // Optional, if global setup is needed in the future
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
