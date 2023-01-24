import { KeyValueMap, nonenumerable } from './HttpTypes'

/**
 * Generic representation of a Http Response.
 */

export class HttpResponse<UnderlyingResponse = any> {
  /**
   * Allows building upon the default object.
   * @param defaults
   * @returns
   */
  static fromDefaults = (defaults: Partial<HttpResponse>) => {
    const req = new HttpResponse()
    Object.assign(req, defaults)
    return req
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
