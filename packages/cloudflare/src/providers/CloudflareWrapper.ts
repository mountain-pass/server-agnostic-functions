import { ExecutionContext, Request } from '@cloudflare/workers-types'
import {
  AgnosticRouter,
  HttpMethod,
  urlSearchParamsToKeyValueArrayMap,
  HttpRequest,
  HttpResponse
} from '@mountainpass/server-agnostic-functions-core'

export type CloudflareRequest<Environment = any> = { req: Request; ctx: ExecutionContext; env: Environment }

export type CloudflareResponseConstructor<Response = any> = (body: string, options: any) => Response

/**
 * NOTE Response is not exported from @cloudflare/workers-types - only DECLARED. So it has to be supplied at runtime. :|
 * @param responseConstructor
 * @param agnosticRouter
 * @returns
 */
export const wrap = <CloudflareEnvironment = any>(
  responseConstructor: CloudflareResponseConstructor,
  agnosticRouter: AgnosticRouter<CloudflareRequest<CloudflareEnvironment>, undefined>
) => {
  return async (req: Request, env: CloudflareEnvironment, ctx: ExecutionContext): Promise<any> => {
    try {
      // map request
      const request = new HttpRequest()
      const url = new URL(req.url)
      request.method = req.method.toLowerCase() as HttpMethod
      request.path = url.pathname
      // map headers
      request.headers = Object.fromEntries(
        Object.entries(Object.fromEntries(req.headers)).map(([k, v]) => [k.toLowerCase(), [v]])
      )
      // map query
      request.query = urlSearchParamsToKeyValueArrayMap(url.searchParams)
      // map body
      request.body = await req.text()
      // map underlying
      request.underlying = { req, ctx, env }

      // handle route
      const response = new HttpResponse()
      await agnosticRouter.handle(request, response)

      // map response
      return responseConstructor(response.body, { status: response.statusCode, headers: response.headers })
    } catch (e: any) {
      console.log(e)
      return responseConstructor(e.message, { status: 500, headers: {} })
    }
  }
}
