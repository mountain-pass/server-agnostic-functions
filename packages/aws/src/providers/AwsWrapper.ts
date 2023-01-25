import { AgnosticRouter, HttpResponse } from '@mountainpass/server-agnostic-functions-core'
import { APIGatewayProxyResult, Context } from 'aws-lambda'
import { AwsRequest, mapRequest, mapResponse } from '../utils/RequestResponseMapping'

/**
 * Maps the AWS event to a HttpRequest, handles the route, and maps the response to an AWS APIGatewayProxyResult.
 * @param agnosticRouter
 * @returns
 */
export const wrap = (agnosticRouter: AgnosticRouter<AwsRequest, undefined>) => {
  return async (untypedEvent: any, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      // map request
      const request = mapRequest<AwsRequest>(untypedEvent, context)
      const response = new HttpResponse()

      // handle route
      await agnosticRouter.handle(request, response)

      // map response
      return mapResponse(response)
    } catch (e: any) {
      console.log(e)
      return { statusCode: 500, body: JSON.stringify({ message: e.message }) }
    }
  }
}
