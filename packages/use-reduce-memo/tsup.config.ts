import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'use-reduce-memo': './src/index.ts',
    },
    format: ['cjs'],
    sourcemap: true,
    target: 'es2019' // Transforms optional chaining for Webpack 4.
  },
  {
    dts: true,
    entry: {
      'use-reduce-memo': './src/index.ts',
    },
    format: ['esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
