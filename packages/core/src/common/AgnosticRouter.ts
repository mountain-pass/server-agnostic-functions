import { convertToRegexMatcher, parsePathParams } from './HttpPathUtils'
import { HttpResponse } from '../types/HttpResponse'
import { HttpRequest } from '../types/HttpRequest'

/**
 * Handler for a Http Request.
 *
 * Modify the response object to send a response to the client. The return object is ignored.
 */
export type RouteHandler<UnderlyingRequest = any, UnderlyingResponse = any> = (
  req: HttpRequest<UnderlyingRequest>,
  res: HttpResponse<UnderlyingResponse>
) => Promise<any> | any

/* Types for handling Routes. */

export type RegexToRouteTuple = { key: RegExp; value: RouteHandler }
export type RegexRoutes = RegexToRouteTuple[]
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'connect' | 'trace'
// eslint-disable-next-line no-unused-vars
export type HttpMethodLookup = { [key in HttpMethod]: RegexRoutes }

/**
 * A generic HttpRequest Router.
 */
export class AgnosticRouter<UnderlyingRequest = any, UnderlyingResponse = any> {
  middleware: RouteHandler<UnderlyingRequest, UnderlyingResponse>[] = []

  routes: HttpMethodLookup = {
    get: [],
    post: [],
    put: [],
    delete: [],
    patch: [],
    head: [],
    options: [],
    connect: [],
    trace: []
  }

  /**
   * Used to provide intercepting middleware to every request.
   * @param handler
   */
  use = (handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.middleware.push(handler)
  }

  get = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.get.push({ key: convertToRegexMatcher(path), value: handler })
  }

  post = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.post.push({ key: convertToRegexMatcher(path), value: handler })
  }

  put = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.put.push({ key: convertToRegexMatcher(path), value: handler })
  }

  delete = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.delete.push({ key: convertToRegexMatcher(path), value: handler })
  }

  patch = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.patch.push({ key: convertToRegexMatcher(path), value: handler })
  }

  head = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.head.push({ key: convertToRegexMatcher(path), value: handler })
  }

  options = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.options.push({ key: convertToRegexMatcher(path), value: handler })
  }

  connect = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.connect.push({ key: convertToRegexMatcher(path), value: handler })
  }

  trace = (path: string, handler: RouteHandler<UnderlyingRequest, UnderlyingResponse>) => {
    this.routes.trace.push({ key: convertToRegexMatcher(path), value: handler })
  }

  // TODO gzip, deflate, br + etag?

  /**
   * Handles the routing of the request.
   * @param req
   * @param res
   * @returns
   */
  handle = async (req: HttpRequest<UnderlyingRequest>, res: HttpResponse<UnderlyingResponse>): Promise<void> => {
    console.log(`req: ${req.method} ${req.path}`)
    // perform middleware
    try {
      for (const middleware of this.middleware) {
        await middleware(req, res)
        if (res.ended) return
      }
    } catch (err: any) {
      // if error, break out of middleware
      console.error('Error#1: ' + err.message, { stack: err.stack })
    }

    // TODO optimise this based on path
    const route = this.routes[req.method].find(({ key: regex }) => {
      // matches, add path params and return true
      if (regex.test(req.path)) {
        req.params = { ...req.params, ...parsePathParams(req.path, regex) }
        return true
      } else {
        // route not handled by this route, continue searching
        return false
      }
    })
    if (route) {
      const handler = route.value
      await handler(req, res)
      if (!res.ended) {
        console.error(`Error#2: Route ${req.method} ${req.path} did not end the response.`)
        res.status(404).send('Not found')
      }
    } else {
      console.info(`Route ${req.method} ${req.path} not found.`)
      res.status(404).send('Not found')
    }
  }
}
