import { ExecutionContext, Request } from '@cloudflare/workers-types'
import {
  AgnosticRouter,
  HttpMethod,
  urlSearchParamsToKeyValueArrayMap,
  HttpRequest,
  HttpResponse
} from '@mountainpass/server-agnostic-functions-core'

type RequestParams = { req: Request; ctx: ExecutionContext; env: any }

export type ResponseConstructor<Response = any> = (body: string, options: any) => Response

/**
 * NOTE Response is not exported from @cloudflare/workers-types - only DECLARED. So it has to be supplied at runtime. :|
 * @param responseConstructor
 * @param agnosticRouter
 * @returns
 */
export const wrap = <CloudflareEnvironment = any>(
  responseConstructor: ResponseConstructor,
  agnosticRouter: AgnosticRouter<RequestParams, undefined>
) => {
  return async (req: Request, ctx: ExecutionContext, env: CloudflareEnvironment): Promise<any> => {
    try {
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
      return responseConstructor(response.body, { status: response.statusCode, headers: response.headers })
    } catch (e: any) {
      console.log(e)
      return responseConstructor(e.message, { status: 500, headers: {} })
    }
  }
}
