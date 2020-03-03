import * as assert from 'assert';
import combined from '../src/memoDecorator';

class Dog {
  barkTimes = 0
  walkSteps = [] as string[]

  @combined()
  async bark() {
    return ++this.barkTimes
  }

  @combined({ batchSize: 3 })
  async walk(step: string) {
    this.walkSteps.push(step)
  }
}

describe('memoDecorator', () => {
  it('merge requests', async () => {
    const dog = new Dog()
    const ans = await Promise.all([dog.bark(), dog.bark(), dog.bark()])

    assert.deepStrictEqual(ans, [1, 1, 1])
    assert.strictEqual(dog.barkTimes, 1)
  });

  it('options', async () => {
    const dog = new Dog()

    await Promise.all([
      dog.walk('left'),
      dog.walk('left'),
      dog.walk('left'),
      dog.walk('left'),  // 4th goes next batch
      dog.walk('left'),
      dog.walk('right'),
    ])

    assert.strictEqual(dog.walkSteps.length, 3)
    assert.strictEqual(dog.walkSteps.filter(x => x === 'left').length, 2)
    assert.strictEqual(dog.walkSteps.filter(x => x === 'right').length, 1)
  });

  it('instances have their own LRUs by default', async () => {
    const dog1 = new Dog()
    const dog2 = new Dog()

    const ans1 = await Promise.all([dog1.bark(), dog2.bark(), dog1.bark()])
    assert.deepStrictEqual(ans1, [1, 1, 1])
    assert.strictEqual(dog1.barkTimes, 1)
    assert.strictEqual(dog2.barkTimes, 1)
  });
});
