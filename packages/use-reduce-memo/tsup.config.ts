import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'use-reduce-memo': './src/index.ts',
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
