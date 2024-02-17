import {defineConfig} from 'tsup'

export default defineConfig([
  {
    entry: {index: 'src/coin.ts'},
    format: ['esm', 'cjs'],
    target: 'es2022',
    dts: true,
    // splitting: false,
    sourcemap: true,
  },
  {
    entry: {index: 'src/coin.ts'},
    globalName: 'CoinFormat',
    format: ['iife'],
    target: 'es2020',
    platform: 'browser',
    outDir: 'dist/browser',
    dts: true,
    outExtension: () => ({js: '.min.js'}),
    splitting: true,
    sourcemap: true,
    minify: true,
    noExternal: [/.*/],
  },
])
