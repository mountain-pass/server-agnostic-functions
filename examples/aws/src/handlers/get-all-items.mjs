// NOTE running locally can't see locally imported packages - probably because it's running inside a docker container.
// import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
// import AwsWrapper from '@mountainpass/server-agnostic-functions-aws'
// import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'
// import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import {
  AgnosticRouter,
  // HttpMethod,
  HttpRequest,
  HttpResponse,
  // KeyValueArrayMap,
  // KeyValueMap
} from '@mountainpass/server-agnostic-functions-core'

// type RequestParams = { context: Context; event: APIGatewayEvent }

/** For mapping string => string. */
const mapKeyValueParamsToKeyValueMap = (
  params,
  normaliseKeys = false
) => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [normaliseKeys ? k.toLowerCase() : k, typeof v === 'string' ? (v + '') : ''])
  )
}
/** For mapping string => string[]. */
const mapKeyValueParamsToKeyValueArrayMap = (
  params,
  normaliseKeys = false
  ) => {
  if (typeof params === 'undefined' || params === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(params)
      .filter((keyValue) => keyValue.length > 1 && typeof keyValue[1] !== 'undefined')
      .map(([k, v]) => [normaliseKeys ? k.toLowerCase() : k, typeof v === 'string' ? [v] : (v)])
  )
}

/**
 * Maps the AWS event to a HttpRequest, handles the route, and maps the response to an AWS APIGatewayProxyResult.
 * @param agnosticRouter
 * @returns
 */
export const wrap = (agnosticRouter) => {
  return async (event, context) => {
    try {
      // map request
      const request = new HttpRequest()
      request.method = event.httpMethod.toLowerCase()
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
      // map underlying resources
      request.underlying = { event, context }
      request.body = event.body === null ? '' : event.body

      // handle route
      const response = new HttpResponse()
      await agnosticRouter.handle(request, response)

      // map response
      return { statusCode: response.statusCode, body: response.body, headers: response.headers }
    } catch (e) {
      console.log(e)
      return { statusCode: 500, body: JSON.stringify({ message: e.message }) }
    }
  }
}


// workaround start (see above)

const router = new AgnosticRouter()

router.get('/api/', (req, res) => {
  res.headers.Location = '/api/hello?name=bob'
  res.status(307)
  res.send('')
})

router.get('/api/hello', (req, res) => {
  res.send(`hello ${req.query.name || req.params.name || 'world'}`)
})

router.post('/api/upload', (req, res) => {
  req.body = req.json()
  res.json(req)
})

// workaround end

export const handler = wrap(router)
