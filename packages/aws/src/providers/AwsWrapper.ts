import {
  AgnosticRouter,
  AgnosticRouterWrapperInterface,
  HttpRequest,
  HttpResponse
} from '@mountainpass/server-agnostic-functions-core'
import { APIGatewayProxyResult, Context } from 'aws-lambda'
import { AwsHandler, AwsRequest, mapRequest, mapResponse } from '../utils/RequestResponseMapping'

/**
 * Maps the AWS event to a HttpRequest, handles the route, and maps the response to an AWS APIGatewayProxyResult.
 * @param agnosticRouter
 * @returns
 */
export class AwsWrapper extends AgnosticRouterWrapperInterface<AwsRequest, APIGatewayProxyResult, AwsHandler> {
  async mapRequest(from: AwsRequest, to: HttpRequest<any> = new HttpRequest()): Promise<HttpRequest<any>> {
    return mapRequest<AwsRequest>(from.event, from.context, to)
  }

  async mapResponse(from: HttpResponse<any>, to: APIGatewayProxyResult = {} as any): Promise<APIGatewayProxyResult> {
    return mapResponse(from)
  }

  wrap(agnosticRouter: AgnosticRouter<any, any>): AwsHandler {
    return async (untypedEvent: any, context: Context): Promise<APIGatewayProxyResult> => {
      try {
        // map request
        const request = await this.mapRequest({ event: untypedEvent, context })
        const response = new HttpResponse()

        // handle route
        await agnosticRouter.handle(request, response)

        // map response
        return this.mapResponse(response)
      } catch (e: any) {
        console.log(e)
        return { statusCode: 500, body: JSON.stringify({ message: e.message }) }
      }
    }
  }
}
