export default [
  {
    input: 'lib/index.js',
    external: ['lru-cache'],
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'memoAsyncFn',
    }
  },
]
