# memo-async

combine async / promise calls and cache result in memory with LRU

[![npm](https://img.shields.io/npm/v/memo-async?style=flat)](https://www.npmjs.com/package/memo-async) [![](https://github.com/lyonbot/memo-async-fn/workflows/Node.js%20CI/badge.svg)](https://github.com/lyonbot/memo-async-fn)

```js
import memoAsync from 'memo-async'

const getUserInfo = memoAsync(   // <- magic
  async (userId) => {
    const { data } = await fetcher('http://xxx/', { userId })
    return data
  }
)


const user1 = await getUserInfo(12)   // send request
const user2 = await getUserInfo(12)   // (cached) re-use 1st request
const user3 = await getUserInfo(9)    // send request
const user4 = await getUserInfo(12)   // (cached) re-use 1st request

// in a short time...

const user5 = await getUserInfo(12)   // get cached result,
                                      // or send request if last request failed

// after seconds...

const user6 = await getUserInfo(12)   // send request (cache expired)

```

## API

this package provides `memoAsync`, which can be a utility function, or a decorator:

- `memoAsync(fn, opts)` returns an wrapped async function, which may combine calls and cache result in memory.

  - **fn** : `Function` - your async function
  - **opts** : `MemoOptions` - optional, see below

- `memoAsync(opts)` returns a class method decorator

  - **opts** : `MemoOptions` - optional, see below

  Note: each instance has its own LRU cache in memory by default.

  If you have many instances, consider using exact one LRUCache by setting `opts.cache`. Meanwhile, do not forget writing a `opts.genKey`

  **decorator example**

  ```js
  class Reporter {
    @memoAsync()
    async readData(filename) {
      // some expensive requests
    }
  }

  const joe = new Reporter()
  // now joe.readData() may merge and cache requests
  ```

### MemoOptions

- **genKey** : `(...args) => string`

  compute the cache key from arguments.

  *default*: treat args as strings and concat them

  if you are using memoAsync within a class, you may use `this` while computing

- **duration** : `number`

  duration of one batch, aka. how long a result can be cached.

  *default*: 3000 (ms)

- **batchSize** : `number`

  how many requests (invoking) can be merged into one.

  *default*: 500 (# req)

- **cache** : `LRUCache`

  use an existing [lru-cache](https://www.npmjs.com/package/lru-cache) instance.

  if not set, memoAsync will create one.

- **cacheSize** : `number`

  set the cache capacity.
  works when `cache` is not given.

  *default*: 1000

- **onHit** : `(key, result, args) => void`  callback when cache is hit.

  - **key** : `string`  the cache key

  - **result** : `Promise`   the cached Promise. you cannot change it

  - **args** : `any[]`   array of arguments

  Note: if you are using memoAsync within a class, `this` will be set.
