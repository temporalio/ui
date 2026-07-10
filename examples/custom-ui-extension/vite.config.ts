import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const headers = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self' ws://127.0.0.1:8090",
    "form-action 'none'",
    'frame-ancestors http://localhost:3000',
    "object-src 'none'",
  ].join('; '),
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export default defineConfig({
  root,
  server: {
    host: '127.0.0.1',
    port: 8090,
    strictPort: true,
    headers,
  },
  preview: {
    host: '127.0.0.1',
    port: 8090,
    strictPort: true,
    headers,
  },
});
