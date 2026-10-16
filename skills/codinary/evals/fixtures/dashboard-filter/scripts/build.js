import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await cp('packages/web', 'dist', { recursive: true });
console.log('Production assets built in dist');
