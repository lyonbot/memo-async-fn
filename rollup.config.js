import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'lib/memoAsyncFn.js',
    plugins: [
      resolve(),
      commonjs(),
      terser(),
    ],
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'memoAsyncFn',
    }
  },
  {
    input: 'lib/index.js',
    external: ['lru-cache'],
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named'
    }
  }
]
