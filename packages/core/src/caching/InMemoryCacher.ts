import { createHash } from 'crypto'
import { makeQuerablePromise, QueryablePromise } from './makeQueryablePromise'
export const hashString = (str: string) => createHash('sha1').update(str).digest().toString('base64')

export type FetchResponse<Type> = {
  /** The data object */
  data: Type
  /** Hash - optional hash of the object (can be used for etag or versioning). */
  hash?: string
}

export type FetchResponseQueryablePromise<Type> = QueryablePromise<FetchResponse<Type>>

export class InternalCacheEntry<Type> {
  promise: FetchResponseQueryablePromise<Type>
  expiresTs: number
  cacheHit?: boolean
  constructor(promise: FetchResponseQueryablePromise<Type>, expiresTs: number) {
    this.promise = promise
    this.expiresTs = expiresTs
  }

  isActive() {
    return this.expiresTs > Date.now()
  }
}

/**
 * Describes a function, which can load data based on a key.
 *
 * Receives a key, and optionally the previous data.
 *
 * Use the previous hash/data (if available and fulfilled), to avoid fetching data if source data hasn't changed
 */
export type Fetcher<Type> = {
  (key: string, prevData?: FetchResponseQueryablePromise<Type>): Promise<FetchResponse<Type>> | FetchResponse<Type>
}

export type InMemoryCacherOptions = {
  maxAgeMs: number
  maxItems?: number
}

const debugLogging = process.env.LOG_LEVEL === 'debug'

/**
 * Stores an item in memory for a given amount of time.
 *
 * Returns a promise, which can be shared by multiple resolvers.
 *
 * If `maxItems` is set, the items that will expire the soonest are ejected.
 */
export class InMemoryCacher<Type> {
  fetcher: Fetcher<Type>
  cache: { [key: string]: InternalCacheEntry<Type> } = {}
  options: InMemoryCacherOptions

  /**
   *
   * @param fetcher - the ability to load data based on a key
   * @param maxAgeMs - how long to cache a result for
   */
  constructor(fetcher: Fetcher<Type>, options: InMemoryCacherOptions) {
    this.fetcher = fetcher
    this.options = options
  }

  fetch(key: string): InternalCacheEntry<Type> {
    let prevData = this.cache[key]
    const cacheHit = typeof prevData !== 'undefined' && prevData.isActive()

    // if data is old or missing, refetch...
    if (!cacheHit) {
      if (debugLogging) console.log('cache miss', { key, expireAfter: prevData?.expiresTs, now: Date.now() })
      const fetchResponse = this.fetcher(key, prevData?.promise)
      // retrieve previous data (may be undefined, may be an inflight promise)
      prevData = new InternalCacheEntry<Type>(makeQuerablePromise(fetchResponse), Date.now() + this.options.maxAgeMs)
      this.cache[key] = prevData
    }
    prevData.cacheHit = cacheHit
    // cleanup
    let entries = Object.entries(this.cache)
    const count = entries.length
    // clean up expired keys
    entries = entries.filter(([, entry]) => entry.isActive())
    // enforce max items (soonest expiresTs are removed first)
    if (this.options.maxItems && entries.length > this.options.maxItems) {
      entries = entries.sort((a, b) => b[1].expiresTs - a[1].expiresTs).slice(0, this.options.maxItems)
    }
    this.cache = Object.fromEntries(entries)
    if (debugLogging && entries.length !== count)
      console.log('cache cleanup', { count: count - entries.length, remaining: entries.length })
    //
    return prevData
  }
}
