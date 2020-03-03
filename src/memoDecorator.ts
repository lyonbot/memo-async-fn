import memoAsyncFn, { MemoOptions, LRUType } from "./memoAsyncFn"
import makeDefaultLRU from "./makeDefaultLRU"

const $LRUs = Symbol()

const getDefaultLRUFromInst = (inst: any, fnName: string | symbol, opts: MemoOptions) => {
  if (!inst[$LRUs]) inst[$LRUs] = {}
  const LRUs = inst[$LRUs]

  const LRU = LRUs[fnName] as LRUType
  if (!LRU) {
    return LRUs[fnName] = makeDefaultLRU(opts)
  }
  return LRU
}

function combined(opts: MemoOptions = {}): MethodDecorator {
  return function (target, key, descriptor: PropertyDescriptor) {
    const oldFn = descriptor.value

    descriptor.value = memoAsyncFn(oldFn, {
      cache() { return getDefaultLRUFromInst(this, key, opts) },
      ...opts
    })
  }
}

export default combined
