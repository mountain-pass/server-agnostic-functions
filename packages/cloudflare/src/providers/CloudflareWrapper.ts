import { ExecutionContext, Request } from '@cloudflare/workers-types'
import {
  AgnosticRouter,
  HttpMethod,
  urlSearchParamsToKeyValueArrayMap,
  HttpRequest,
  HttpResponse,
  AgnosticRouterWrapperInterface
} from '@mountainpass/server-agnostic-functions-core'

export type CloudflareRequest<Environment = any> = { req: Request; ctx: ExecutionContext; env: Environment }

export type CloudflareResponseConstructor<Response = any> = (body: string, options: any) => Response

type CloudflareHandler<CloudflareEnvironment = any> = (
  req: Request,
  env: CloudflareEnvironment,
  ctx: ExecutionContext
) => Promise<any>

/**
 * NOTE responseConstructor is not exported from @cloudflare/workers-types - only DECLARED. So it has to be supplied at runtime. :|
 * @param responseConstructor
 * @param agnosticRouter
 * @returns
 */
export class CloudflareWrapper<CloudflareEnvironment = any> extends AgnosticRouterWrapperInterface<
  CloudflareRequest,
  undefined,
  CloudflareHandler<CloudflareEnvironment>
> {
  responseConstructor: CloudflareResponseConstructor

  constructor(responseConstructor: CloudflareResponseConstructor) {
    super()
    this.responseConstructor = responseConstructor
  }

  async mapRequest(from: CloudflareRequest, to: HttpRequest<CloudflareRequest>): Promise<HttpRequest<any>> {
    const url = new URL(from.req.url)
    to.method = from.req.method.toLowerCase() as HttpMethod
    to.path = url.pathname
    // map headers
    to.headers = Object.fromEntries(
      Object.entries(Object.fromEntries(from.req.headers)).map(([k, v]) => [k.toLowerCase(), [v]])
    )
    // map query
    to.query = urlSearchParamsToKeyValueArrayMap(url.searchParams)
    // map body
    to.body = await from.req.text()
    // map underlying
    to.underlying = from
    return to
  }

  async mapResponse(from: HttpResponse<any>, to: undefined): Promise<undefined> {
    throw new Error('Not implemented')
  }

  wrap(agnosticRouter: AgnosticRouter): CloudflareHandler<CloudflareEnvironment> {
    return async (req: Request, env: CloudflareEnvironment, ctx: ExecutionContext): Promise<any> => {
      try {
        // map request
        const request = await this.mapRequest({ req, env, ctx }, new HttpRequest())

        // handle route
        const response = new HttpResponse()
        await agnosticRouter.handle(request, response)

        // map response
        return this.responseConstructor(response.body, { status: response.statusCode, headers: response.headers })
      } catch (e: any) {
        console.log(e)
        return this.responseConstructor(e.message, { status: 500, headers: {} })
      }
    }
  }
}
