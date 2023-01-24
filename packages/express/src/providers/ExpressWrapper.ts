import { Request, Response, Router } from 'express'
import { AgnosticRouter, HttpMethod, HttpRequest, HttpResponse } from '@mountainpass/server-agnostic-functions-core'

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

export const wrap = (expressRouter: Router, agnosticRouter: AgnosticRouter): Router => {
  // NOTE let all serverless functions know, that we're running in stateful mode
  process.env.STATEFUL_MODE = 'true'

  // serve all requests to the parent router's handle method
  expressRouter.use(async (req: Request, res: Response) => {
    try {
      // map incoming requests
      const request = new HttpRequest()
      request.method = req.method.toLowerCase() as HttpMethod
      request.path = req.originalUrl
      request.body = req.body
      // setup headers
      if (req.headers) {
        Object.entries(req.headers).forEach(([key, value]) => {
          request.headers[key.toLowerCase()] = Array.isArray(value) ? (value as string[]) : [value as string]
        })
      }
      // setup query parameters
      if (req.query) {
        Object.entries(req.query).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            const first = value[0]
            if (typeof first === 'string') {
              request.query[key] = value as string[]
            } else {
              request.query[key] = value.map((v) => v.toString())
            }
          } else if (typeof value === 'string') {
            request.query[key] = [value]
          } else {
            request.query[key] = [(value || '').toString()]
          }
        })
      }
      // setup body
      if (request.method === 'post' || request.method === 'put') {
        request.body = await bodyToText(req)
      }
      request.underlying = req
      // setup http response
      const response = new HttpResponse()
      response.underlying = res
      // invoke the handler
      await agnosticRouter.handle(request, response)
      // map outgoing response to express response
      res.status(response.statusCode)
      Object.entries(response.headers).forEach(([key, value]) => res.setHeader(key, value))
      res.send(response.body)
    } catch (e: any) {
      console.log(`ERROR: ${e.message}`, { stack: e.stack })
      res.status(500).send(e.message)
    } finally {
      res.end()
    }
  })
  return expressRouter
}
