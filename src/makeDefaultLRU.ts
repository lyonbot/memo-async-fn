import * as LRUCache from 'lru-cache';
import { MemoOptions, LRUData } from './memoAsyncFn';

export default function makeDefaultLRU(opts: MemoOptions) {
  return new LRUCache<string, LRUData>({ max: opts.cacheSize || 1000 });
}
