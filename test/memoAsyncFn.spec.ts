import * as assert from 'assert';
import memoAsync from '../src';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('memoAsync', () => {
  it('merge requests', async () => {
    const cnt = { a: 0, b: 0, c: 0 };
    const fn = memoAsync(async (key) => ++cnt[key]);
    const calls = await Promise.all([
      fn('a'), fn('a'), fn('a'), fn('a'),
      fn('b'), fn('b'), fn('b'), fn('b'),
      fn('c'), fn('c'), fn('c'), fn('c'),
    ]);

    assert.deepStrictEqual(calls, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    assert.deepStrictEqual(cnt, { a: 1, b: 1, c: 1 });
  });

  it('skip cache if genKey returns empty', async () => {
    const cnt = { a: 0, b: 0, c: 0 };
    const fn = memoAsync(
      async (id) => ++cnt[id],
      {
        genKey: (id) => id == 'c' ? '' : id   // no cache for "c"
      }
    );
    const calls = await Promise.all([
      fn('a'), fn('a'), fn('a'), fn('a'),
      fn('b'), fn('b'), fn('b'), fn('b'),
      fn('c'), fn('c'), fn('c'), fn('c'),
    ]);

    assert.deepStrictEqual(calls.slice(0, -4), [1, 1, 1, 1, 1, 1, 1, 1]);
    assert.deepStrictEqual(cnt, { a: 1, b: 1, c: 4 });
  });

  it('onHit', async () => {
    const cnt = { a: 0, b: 0, c: 0 };
    const hits = { a: 0, b: 0, c: 0 };
    const fn = memoAsync(
      async (id) => ++cnt[id],
      {
        onHit(_1, _2, [id]) { hits[id]++ }
      }
    );
    const calls = await Promise.all([
      fn('a'), fn('a'), fn('a'), fn('a'),
      fn('b'), fn('b'), fn('b'), fn('b'),
      fn('c'), fn('c'), fn('c'), fn('c'),
    ]);

    assert.deepStrictEqual(calls, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    assert.deepStrictEqual(cnt, { a: 1, b: 1, c: 1 });
    assert.deepStrictEqual(hits, { a: 3, b: 3, c: 3 });
  });

  it('batchSize', async () => {
    const cnt = { a: 0, b: 0, c: 0 };
    const fn = memoAsync(async (key) => ++cnt[key], { batchSize: 2 });
    const calls = await Promise.all([
      fn('a'), fn('a'), fn('a'), fn('a'),
      fn('b'), fn('b'), fn('b'), fn('b'),
      fn('c'), fn('c'), fn('c'), fn('c'),
    ]);

    assert.deepStrictEqual(calls, [1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2]);
    assert.deepStrictEqual(cnt, { a: 2, b: 2, c: 2 });
  });

  it('duration', async () => {
    const cnt = { a: 0, b: 0, c: 0 };
    const fn = memoAsync(
      async (key) => {
        await delay(70)
        return ++cnt[key]
      },
      { duration: 30 },
    );

    const calls1 = await Promise.all([
      fn('a'), fn('a'),
      fn('b'), fn('b'),
      fn('c'), fn('c'),
    ]);

    const calls2 = await Promise.all([
      fn('a'), fn('a'),
      fn('b'), fn('b'),
      fn('c'), fn('c'),
    ]);

    assert.deepStrictEqual(calls1, [1, 1, 1, 1, 1, 1]);
    assert.deepStrictEqual(calls2, [2, 2, 2, 2, 2, 2]);
    assert.deepStrictEqual(cnt, { a: 2, b: 2, c: 2 });
  });

  it('not cache throwed stuff', async () => {
    let throwTimes = 0
    let passTimes = 0

    const fn = memoAsync(async (odd) => {
      await delay(10)
      if (odd % 2) {
        passTimes++
        return { code: 0 }
      } else {
        throwTimes++
        throw new Error('not an odd')
      }
    }, {
      duration: 50
    });

    const calls1 = await Promise.all([
      fn(1), fn(1),
      fn(2).catch(err => err), fn(2).catch(err => err)
    ]);

    assert.deepStrictEqual(calls1.slice(0, 2), [{ code: 0 }, { code: 0 }]);
    assert.strictEqual(calls1[0], calls1[1], 'two successful requests got same result')

    assert(calls1[2] instanceof Error)
    assert.strictEqual(calls1[2], calls1[3], 'two failed requests got same Error')

    assert.strictEqual(passTimes, 1)
    assert.strictEqual(throwTimes, 1)

    const calls2 = await Promise.all([
      fn(1), fn(1),
      fn(2).catch(err => err), fn(2).catch(err => err)
    ]);

    assert.deepStrictEqual(calls2.slice(0, 2), [{ code: 0 }, { code: 0 }]);
    assert.strictEqual(calls2[0], calls2[1], 'two successful requests got same result')

    assert(calls2[2] instanceof Error)
    assert.strictEqual(calls2[2], calls2[3], 'two failed requests got same Error')

    assert.notStrictEqual(calls1[2], calls2[3], 'Error shall not be cached')
    assert.strictEqual(passTimes, 1)
    assert.strictEqual(throwTimes, 2)
  });
});
