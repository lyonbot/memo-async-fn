# memo-async-fn

combine async / promise calls and cache result in memory with LRU

![](https://github.com/lyonbot/memo-async-fn/workflows/Node.js%20CI/badge.svg)

```js
import memoAsyncFn from 'memo-async-fn'

const getUserInfo = memoAsyncFn(
  async (userId) => {
    const { data } = await fetcher('http://xxx/', { userId })
    return data
  }
)


const user1 = await getUserInfo(12)   // send request
const user2 = await getUserInfo(12)   // merged to 1st request
const user3 = await getUserInfo(9)    // send request
const user4 = await getUserInfo(12)   // merged too

// after few seconds...

const user5 = await getUserInfo(12)   // get cached result
```

## API

- `memoAsyncFn(fn, opts)`
  - `opts`: optional. see `MemoOptions` in <./src/memoAsyncFn.ts>
