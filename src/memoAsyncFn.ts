import LRUCache from 'lru-cache'
import makeDefaultLRU from './makeDefaultLRU';

export interface LRUData {
  /** the request and its result */
  promise: Promise<any>

  /** reference counter */
  count: number
}

export type LRUType = LRUCache<string, LRUData>

export interface MemoOptions<ARGS extends any[] = any[], RESULT = any> {
  /** use an existing lru-cache instance. by default, memoAsyncFn will make one */
  cache?: LRUType | ((...args: ARGS) => LRUType)

  /** set the cache capacity. works when `cache` is not given. default: 1000. */
  cacheSize?: number

  /** compute the cache key from arguments. default: concat args as string */
  genKey?: (...args: ARGS) => string

  /** callback when cache is hit. */
  onHit?: (key: string, result: Promise<RESULT>, args: ARGS) => void

  /** duration of one batch, aka. how long a result can be cached */
  duration?: number

  /** how many requests (invoking) can be merged into one. */
  batchSize?: number
}

export default function memoAsyncFn<
  ARGS extends any[],
  RESULT
>(
  fn: (...args: ARGS) => Promise<RESULT>,
  opts: MemoOptions<ARGS, RESULT> = {}
): (...args: ARGS) => Promise<RESULT> {
  const {
    duration = 3000,
    batchSize = 500,
    genKey = (...args: ARGS) => "/" + args.map(x => String(x)).join('\n'),
    cache: _cache = makeDefaultLRU(opts)
  } = opts;

  function newFn(...args: ARGS): Promise<RESULT> {
    const cache: LRUType = typeof _cache === 'function' ? _cache.apply(this, args) : _cache
    const key = genKey.apply(this, args);
    if (!cache || !key) return fn.apply(this, args);

    let batch = cache.get(key);
    if (!batch || batch.count >= batchSize) {
      batch = { count: 1, promise: null };
      const promise = fn.apply(this, args)
        .catch((err: Error) => {
          /* istanbul ignore else */
          if (cache.peek(key) === batch) cache.del(key); // remove cache if failed
          throw err;
        });
      batch.promise = promise;
      cache.set(key, batch, duration);
    } else { // hit the cache
      batch.count++;
      if (opts.onHit) opts.onHit(key, batch.promise, args);
    }

    return batch.promise;
  };

  return newFn;
}
