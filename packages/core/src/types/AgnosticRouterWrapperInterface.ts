import { AgnosticRouter } from '../common/AgnosticRouter'
import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'

export class AgnosticRouterWrapperInterface<SourceRequest, SourceResponse, ResponseType> {
  async mapRequest(from: SourceRequest, to: HttpRequest): Promise<HttpRequest> {
    return to
  }

  async mapResponse(from: HttpResponse, to: SourceResponse): Promise<SourceResponse> {
    return to
  }

  wrap(agnosticRouter: AgnosticRouter) {
    return undefined as ResponseType
  }
}
