import {
  HttpMethod,
  HttpRequest,
  HttpResponse,
  KeyValueArrayMap,
  KeyValueMap
} from '@mountainpass/server-agnostic-functions-core'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'

export type AwsRequest = { context: Context; event: APIGatewayProxyEvent | APIGatewayProxyEventV2 }
export type AwsHandler = (event: any, context: Context) => Promise<APIGatewayProxyResult>

/** For mapping string => string. */
const mapKeyValueParamsToKeyValueMap = (
  params: { [key: string]: string | string[] | undefined } | undefined | null,
  normaliseKeys: boolean = false
): KeyValueMap => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [normaliseKeys ? k.toLowerCase() : k, typeof v === 'string' ? (v as string) : ''])
  )
}
/** For mapping string => string[]. */
const mapKeyValueParamsToKeyValueArrayMap = (
  params: { [key: string]: string | string[] | undefined } | undefined | null,
  normaliseKeys: boolean = false
): KeyValueArrayMap => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [normaliseKeys ? k.toLowerCase() : k, typeof v === 'string' ? [v] : (v as string[])])
  )
}

const mapV2QueryParamsToKeyValueArrayMap = (
  params: APIGatewayProxyEventQueryStringParameters | undefined | null,
  normaliseKeys: boolean = false
): KeyValueArrayMap => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [normaliseKeys ? k.toLowerCase() : k, typeof v === 'string' ? v.split(',') : []])
  )
}

/**
 * Maps from an Aws APIGatewayProxyEvent v1/v2 to a HttpRequest.
 * @param untypedEvent
 * @param context
 * @returns
 */
export const mapRequest = <UnderlyingRequest = any>(
  untypedEvent: any,
  context: Context,
  request: HttpRequest = new HttpRequest()
): HttpRequest<UnderlyingRequest> => {
  if (typeof untypedEvent.version === 'undefined' || untypedEvent.version === '1.0') {
    // version 1.0
    // map request
    const event = untypedEvent as APIGatewayProxyEvent
    request.method = event.httpMethod.toLowerCase() as HttpMethod
    request.path = event.path
    // map headers
    request.headers = {
      ...mapKeyValueParamsToKeyValueArrayMap(event.headers, true),
      ...mapKeyValueParamsToKeyValueArrayMap(event.multiValueHeaders, true)
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
    // map body
    request.body = event.body === null ? '' : event.body
    // map underlying resources
    request.underlying = { event, context }
  } else if (untypedEvent.version === '2.0') {
    // TODO version 2.0
    const event = untypedEvent as APIGatewayProxyEventV2
    event.requestContext.http.method.toLowerCase() as HttpMethod
    request.method = event.requestContext.http.method.toLowerCase() as HttpMethod
    request.path = event.requestContext.http.path
    //   map headers
    request.headers = {
      ...mapKeyValueParamsToKeyValueArrayMap(event.headers, true)
      // ...mapKeyValueParamsToKeyValueArrayMap(event.multiValueHeaders, true)
    }
    // map query - APIGatewayProxyEventQueryStringParameters
    request.query = {
      ...mapV2QueryParamsToKeyValueArrayMap(event.queryStringParameters)
      // ...mapKeyValueParamsToKeyValueArrayMap(event.multiValueQueryStringParameters)
    }
    // map path parameters
    request.params = {
      ...mapKeyValueParamsToKeyValueMap(event.pathParameters)
    }
    // // map body
    request.body = event.body ? event.body : ''
    // map underlying resources
    request.underlying = { event, context }
  } else {
    throw new Error(`Unknown API Gateway version: ${untypedEvent.version}`)
  }
  return request
}

export const mapResponse = (response: HttpResponse): APIGatewayProxyResult => {
  return {
    statusCode: response.statusCode,
    body: response.body,
    multiValueHeaders: response.headers
  }
}
