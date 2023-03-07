
import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-core'
import aws from '@mountainpass/server-agnostic-functions-aws'

export const lambdaHandler = new aws.AwsWrapper().wrap(diagnosticRouter())
