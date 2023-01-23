import { HttpMethod } from '../common/AgnosticRouter'
import { KeyValueArrayMap, KeyValueMap, nonenumerable } from './HttpTypes'

/**
 * Generic representation of a Http Request.
 */
export class HttpRequest<UnderlyingRequest = any> {
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
