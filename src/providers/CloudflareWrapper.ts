import { ExecutionContext, Request, Response } from '@cloudflare/workers-types'
import { AgnosticRouter, HttpMethod } from '../common/AgnosticRouter'
import { urlSearchParamsToKeyValueArrayMap } from '../common/HttpPathUtils'
import HttpRequest from '../types/HttpRequest'
import HttpResponse from '../types/HttpResponse'

type RequestParams = { req: Request; ctx: ExecutionContext; env: any }

export const wrap = <CloudflareEnvironment = any>(agnosticRouter: AgnosticRouter<RequestParams, undefined>) => {
  return async (req: Request, ctx: ExecutionContext, env: CloudflareEnvironment): Promise<any> => {
    // map request
    const request = new HttpRequest()
    const url = new URL(req.url)
    request.method = req.method.toLowerCase() as HttpMethod
    request.path = url.pathname
    request.headers = Object.fromEntries(
      Object.entries(Object.fromEntries(req.headers)).map(([k, v]) => [k.toLowerCase(), [v]])
    )
    request.query = urlSearchParamsToKeyValueArrayMap(url.searchParams)
    request.body = await req.text()
    request.underlying = { req, ctx, env }

    // handle route
    const response = new HttpResponse()
    await agnosticRouter.handle(request, response)

    // map response
    // NOTE Response is not exported from @cloudflare/workers-types - only DECLARED. It is supplied at runtime. :|
    return new Response(response.data, { status: response.statusCode, headers: response.headers })
  }
}
