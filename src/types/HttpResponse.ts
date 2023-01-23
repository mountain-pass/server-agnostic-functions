import { KeyValueMap, nonenumerable } from './HttpTypes'

/**
 * Generic representation of a Http Response.
 */

export default class HttpResponse<UnderlyingResponse = any> {
  static from = (statusCode: number, object: string | object) => {
    const res = new HttpResponse()
    res.statusCode = statusCode
    if (typeof object === 'string') {
      res.data = object
    } else if (typeof object === 'undefined') {
      // do nothing
    } else {
      res.json(object)
    }
    return res
  }

  // three fields only
  statusCode: number = 200
  headers: KeyValueMap = {}
  data: string = ''

  /**
   * Provides access to the underlying response object.
   */
  @nonenumerable
  underlying?: UnderlyingResponse

  // utilty methods
  status = (code: number): HttpResponse => {
    this.statusCode = code
    return this
  }

  send = (data: string) => (this.data = data)
  json = (object: object) => {
    this.headers['Content-Type'] = 'application/json'
    this.data = JSON.stringify(object)
  }
}
