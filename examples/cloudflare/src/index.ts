import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import { wrap } from '@mountainpass_oss/server-agnostic-functions/src/providers/CloudflareWrapper'

export interface Env {
}

export default {
	// fetch: () => {
	// 	return new Response('hello', { status: 200 })
	// }
	fetch: wrap<Env>(MyAgnosticRoutes)
	// async fetch( request: Request, env: Env, ctx: ExecutionContext ): Promise<Response> {
	// 	const headers = Object.fromEntries(request.headers)
	// 	return router.handle(request, { request, env, ctx, headers })
	// },
};
