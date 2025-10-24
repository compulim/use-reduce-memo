import { defineConfig } from 'tsup';

const BASE_CONFIG = {
  dts: true,
  entry: {
    'use-reduce-memo': './src/index.ts'
  },
  sourcemap: true
};

export default defineConfig([
  {
    ...BASE_CONFIG,
    format: ['cjs'],
    target: 'es2019' // Transforms optional chaining for Webpack 4.
  },
  {
    ...BASE_CONFIG,
    format: ['esm'],
    target: 'esnext'
  }
]);
