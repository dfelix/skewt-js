import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.js'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    minify: true,
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.esm.js' : '.cjs',
      };
    },
  },
  {
    entry: ['src/index.js'],
    format: ['iife'],
    globalName: 'skewt',
    noExternal: [/.*/],
    outExtension() {
      return { js: '.iife.js' };
    },
    minify: true,
  },
]);
