import { KeyValueMap, nonenumerable } from './HttpTypes'

/**
 * Generic representation of a Http Response.
 */

export class HttpResponse<UnderlyingResponse = any> {
  static from = (statusCode: number, object: string | object) => {
    const res = new HttpResponse()
    res.statusCode = statusCode
    if (typeof object === 'string') {
      res.body = object
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
  body: string = ''

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

  send = (data: string) => (this.body = data)
  json = (object: object) => {
    this.headers['Content-Type'] = 'application/json'
    this.body = JSON.stringify(object)
  }
}
