import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import {
  AgnosticRouter,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  KeyValueArrayMap,
  KeyValueMap
} from '@mountainpass/server-agnostic-functions-core'

type RequestParams = { context: Context; event: APIGatewayEvent }

/** For mapping string => string. */
const mapKeyValueParamsToKeyValueMap = (
  params: { [key: string]: string | string[] | undefined } | null
): KeyValueMap => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [k, typeof v === 'string' ? (v as string) : ''])
  )
}
/** For mapping string => string[]. */
const mapKeyValueParamsToKeyValueArrayMap = (
  params: { [key: string]: string | string[] | undefined } | null
): KeyValueArrayMap => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [k, typeof v === 'string' ? [v] : (v as string[])])
  )
}

/**
 * Maps the AWS event to a HttpRequest, handles the route, and maps the response to an AWS APIGatewayProxyResult.
 * @param agnosticRouter
 * @returns
 */
export const wrap = (agnosticRouter: AgnosticRouter<RequestParams, undefined>) => {
  return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      // map request
      const request = new HttpRequest()
      request.method = event.httpMethod.toLowerCase() as HttpMethod
      request.path = event.path
      // map headers
      request.headers = {
        ...mapKeyValueParamsToKeyValueArrayMap(event.headers),
        ...mapKeyValueParamsToKeyValueArrayMap(event.multiValueHeaders)
      }
      // map query
      request.query = {
        ...mapKeyValueParamsToKeyValueArrayMap(event.queryStringParameters),
        ...mapKeyValueParamsToKeyValueArrayMap(event.multiValueQueryStringParameters)
      }
      // map path parameters
      request.params = {
        ...mapKeyValueParamsToKeyValueMap(event.pathParameters)
      }
      // map underlying resources
      request.underlying = { event, context }

      // handle route
      const response = new HttpResponse()
      await agnosticRouter.handle(request, response)

      // map response
      return { statusCode: response.statusCode, body: response.body, headers: response.headers }
    } catch (e: any) {
      console.log(e)
      return { statusCode: 500, body: JSON.stringify({ message: e.message }) }
    }
  }
}
