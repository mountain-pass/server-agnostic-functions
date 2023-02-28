import { HttpRequest } from '../types/HttpRequest'
import { HttpResponse } from '../types/HttpResponse'
import { Fetcher, InMemoryCacher, InMemoryCacherOptions } from './InMemoryCacher'

/**
 * Stores an item in memory for a given amount of time.
 *
 * Returns a promise, which can be shared by multiple resolvers.
 */
export class HttpResponseCacher extends InMemoryCacher<string> {
  cacheControlHeader: string
  constructor(fetcher: Fetcher<string>, options: InMemoryCacherOptions, cacheControlHeader?: string) {
    super(fetcher, options)
    if (typeof cacheControlHeader !== 'undefined') {
      this.cacheControlHeader = cacheControlHeader
    } else {
      const cacheControlSeconds = Math.floor(this.options.maxAgeMs / 1000)
      this.cacheControlHeader = `public, max-age=${cacheControlSeconds}, s-maxage=${cacheControlSeconds}, stale-while-revalidate=${cacheControlSeconds}, stale-if-error=${cacheControlSeconds}`
    }
  }

  /**
   *
   * @param key
   * @param req
   * @param res
   * @param seconds
   */
  async fetchAndServe(
    req: HttpRequest,
    res: HttpResponse,
    key: string,
    cacheControlHeaderOverride?: string
  ): Promise<void> {
    // fetch from cache...
    const cache = this.fetch(key)
    res.headers['x-internal-cache-hit'] = [cache.cacheHit ? 'HIT' : 'MISS']
    const response = await cache.promise
    const hashIsSame =
      typeof response.hash !== 'undefined' && req.headers['if-none-match']?.includes(`"${response.hash}"`)
    // etag matches, return 304, otherwise return data
    if (hashIsSame) {
      res.status(304)
    } else {
      if (typeof this.cacheControlHeader !== 'undefined') res.headers['cache-control'] = [this.cacheControlHeader]
      if (typeof cacheControlHeaderOverride !== 'undefined') res.headers['cache-control'] = [cacheControlHeaderOverride]
      if (typeof response.hash !== 'undefined') res.headers.etag = [`"${response.hash}"`]
      res.send(response.data)
    }
  }
}
