import { expect } from 'chai'
import { describe, it } from 'mocha'
import { hashString, InMemoryCacher } from '../../src/caching/InMemoryCacher'
import { setTimeout } from 'timers/promises'

describe('InMemoryCacher', () => {
  it('promises should resolve the expected values', async () => {
    let i = 0
    const cache = new InMemoryCacher<string>((key: string) => ({ data: key + i++ }), { maxAgeMs: 100 })
    expect(await cache.fetch('a').promise).to.eql({ data: 'a0' })
    expect(await cache.fetch('a').promise).to.eql({ data: 'a0' })
    expect(await cache.fetch('b').promise).to.eql({ data: 'b1' })
    expect(await cache.fetch('b').promise).to.eql({ data: 'b1' })

    await setTimeout(200)
    expect(await cache.fetch('a').promise).to.eql({ data: 'a2' })
    expect(await cache.fetch('a').promise).to.eql({ data: 'a2' })
    expect(await cache.fetch('b').promise).to.eql({ data: 'b3' })
    expect(await cache.fetch('b').promise).to.eql({ data: 'b3' })
  })

  it('hashing should work', () => {
    expect(hashString('abc')).to.eql(5059922895146125)
    expect(hashString('def')).to.eql(1917294213970058)
  })

  it('caches should be hit on subsequent runs', async () => {
    let i = 0
    const cache = new InMemoryCacher<string>((key: string) => ({ data: key + i++ }), { maxAgeMs: 100 })
    expect(cache.fetch('a').cacheHit).to.eql(false)
    expect(cache.fetch('a').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(false)
    expect(cache.fetch('b').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(true)

    await setTimeout(200)
    expect(cache.fetch('a').cacheHit).to.eql(false)
    expect(cache.fetch('a').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(false)
    expect(cache.fetch('b').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(true)
    expect(cache.fetch('b').cacheHit).to.eql(true)
  })
})
