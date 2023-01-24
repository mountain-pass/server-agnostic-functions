// NOTE running aws lambdas locally can't see local 'file:' imported packages - probably because it's running inside a docker container.
import { router } from './MyAgnosticRoutes.mjs'
import AwsWrapper from '@mountainpass/server-agnostic-functions-aws'

export const handler = AwsWrapper.wrap(router)
