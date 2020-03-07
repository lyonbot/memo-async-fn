import memoAsyncFn, { MemoOptions } from "./memoAsyncFn"
import memoAsyncDecorator from "./memoDecorator"

/**
 * Returns an wrapped async function, which may combine calls and cache result in memory.
 * 
 * @param fn    an async function to be wrapped
 * @param opts  (optional) MemoOptions
 */
function memoAsync<ARGS extends any[], RESULT>(
  fn: (...args: ARGS) => Promise<RESULT>,
  opts?: MemoOptions<ARGS, RESULT>
): (...args: ARGS) => Promise<RESULT>

/**
 * Returns a class method decorator.
 * 
 * Note: by default, each instance will have its own LRU cache.
 * If you create many instances, it's recommended to use one LRU and write a customized `genKey`
 * 
 * @example
 *
 * ```js
 * class MyTest {
 *   @memoAsync()
 *   async fetchInfo(userId) {
 *     // some expensive requests
 *   }
 * }
 *
 * const tester = new MyTest()
 * // now tester.fetchInfo is enhanced by memoAsync
 * ```
 * 
 * @param opts   (optional) MemoOptions
 */
function memoAsync<ARGS extends any[], RESULT>(
  opts?: MemoOptions<ARGS, RESULT>
): MethodDecorator

function memoAsync(a: any, b?: any) {
  if (typeof a === 'function') return memoAsyncFn(a, b)
  return memoAsyncDecorator(a)
}

export { LRUData, LRUType, MemoOptions } from "./memoAsyncFn"
export { memoAsync, memoAsyncFn, memoAsyncDecorator }
export default memoAsync
