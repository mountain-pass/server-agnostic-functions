import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import CloudflareWrapper from '@mountainpass_oss/server-agnostic-functions/dist/CloudflareWrapper'

// NOTE Response is not exported from @cloudflare/workers-types - only DECLARED. So it has to be supplied at runtime.
export default {
	fetch: CloudflareWrapper.wrap((body, init) => new Response(body, init), MyAgnosticRoutes)
};