import {
  AgnosticRouter,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  AgnosticRouterWrapperInterface
} from '@mountainpass/server-agnostic-functions-core'
import { Request, Response, Router } from 'express'

// create a router that can be used in express

const bodyToText = async (req: Request): Promise<string> => {
  // check if body has already been parsed...
  if (typeof req.body === 'string') {
    return req.body
  }
  if (typeof req.body === 'object') {
    return req.body
  }
  // otherwise parse the buffer
  if (typeof req.on === 'function') {
    return new Promise((resolve) => {
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        resolve(body)
      })
    })
  }
  return ''
}

export class ExpressWrapper extends AgnosticRouterWrapperInterface<Request, Response, Router> {
  // map incoming requests
  async mapRequest(from: Request, to: HttpRequest): Promise<HttpRequest> {
    to.method = from.method.toLowerCase() as HttpMethod
    to.path = from.originalUrl
    // map body
    to.body = from.body
    // map headers
    if (from.headers) {
      Object.entries(from.headers).forEach(([key, value]) => {
        to.headers[key.toLowerCase()] = Array.isArray(value) ? (value as string[]) : [value as string]
      })
    }
    // map query
    if (from.query) {
      Object.entries(from.query).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          const first = value[0]
          if (typeof first === 'string') {
            to.query[key] = value as string[]
          } else {
            to.query[key] = value.map((v) => v.toString())
          }
        } else if (typeof value === 'string') {
          to.query[key] = [value]
        } else {
          to.query[key] = [(value || '').toString()]
        }
      })
    }
    // map body
    if (to.method === 'post' || to.method === 'put') {
      to.body = await bodyToText(from)
    }
    // map underlying
    to.underlying = from

    return to
  }

  async mapResponse(from: HttpResponse, to: Response): Promise<Response> {
    // map response
    to.status(from.statusCode)
    Object.entries(from.headers).forEach(([key, value]) => to.setHeader(key, value))
    to.send(from.body)
    return to
  }

  wrap(agnosticRouter: AgnosticRouter<any, any>): Router {
    // serve all requests to the parent router's handle method
    const expressRouter = Router()
    expressRouter.use(async (req: Request, res: Response) => {
      try {
        const request = await this.mapRequest(req, new HttpRequest())

        // setup http response
        const response = new HttpResponse()
        response.underlying = res

        // invoke the handler
        await agnosticRouter.handle(request, response)

        await this.mapResponse(response, res)
      } catch (e: any) {
        console.error(`ERROR: ${e.message}`, { stack: e.stack })
        res.status(500).send(e.message)
      } finally {
        res.end()
      }
    })
    return expressRouter
  }
}
