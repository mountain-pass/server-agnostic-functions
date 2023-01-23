import { Request, Response, Router } from 'express'
import { AgnosticRouter, HttpMethod } from '../common/AgnosticRouter'
import HttpRequest from '../types/HttpRequest'
import HttpResponse from '../types/HttpResponse'

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
      // map incoming requests to an agnostic request
      // const path = new URL(req.originalUrl, `http://${req.headers.host}`).pathname
      const path = req.originalUrl
      const request = HttpRequest.from(req.method.toLowerCase() as HttpMethod, path, req.body)
      if (req.headers)
        Object.entries(req.headers).forEach(([key, value]) => {
          request.headers[key.toLowerCase()] = Array.isArray(value) ? (value as string[]) : [value as string]
        })
      if (req.query)
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
      if (request.method === 'post' || request.method === 'put') {
        request.body = await bodyToText(req)
      }
      request.underlying = req
      const response = new HttpResponse()
      response.underlying = res
      // invoke the handler
      await agnosticRouter.handle(request, response)
      // map outgoing response to express response
      res.status(response.statusCode)
      Object.entries(response.headers).forEach(([key, value]) => res.setHeader(key, value))
      res.send(response.data)
    } catch (e: any) {
      console.log(`ERROR: ${e.message}`, { stack: e.stack })
      res.status(500).send(e.message)
    } finally {
      res.end()
    }
  })
  return expressRouter
}
