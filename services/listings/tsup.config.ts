import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/app.ts'],
    format: ['esm'],
    dts: false,
    clean: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
})
