import { HttpMethod } from '../common/AgnosticRouter'
import { KeyValueArrayMap, KeyValueMap, nonenumerable } from './HttpTypes'

/**
 * Generic representation of a Http Request.
 */
export class HttpRequest<UnderlyingRequest = any> {
  /**
   * Allows building upon the default object.
   * @param defaults
   * @returns
   */
  static fromDefaults = (defaults: Partial<HttpRequest>) => {
    const req = new HttpRequest()
    Object.assign(req, defaults)
    return req
  }

  /** Value is lower cased. */
  method: HttpMethod = 'get'
  path: string = '/'
  /** Keys are lower cased. */
  headers: KeyValueArrayMap = {}
  params: KeyValueMap = {}
  query: KeyValueArrayMap = {}
  body: string = ''

  /**
   * Provides access to the underlying request object.
   */
  @nonenumerable
  underlying?: UnderlyingRequest

  json = () => (typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
}
