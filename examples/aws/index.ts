
import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-diagnostics'
import { AwsWrapper } from '@mountainpass/server-agnostic-functions-aws'

export const lambdaHandler = new AwsWrapper().wrap(diagnosticRouter())
