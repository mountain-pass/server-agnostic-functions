import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-diagnostics'
import { CloudflareWrapper } from '@mountainpass/server-agnostic-functions-cloudflare'

// NOTE Response is not exported from @cloudflare/workers-types - only DECLARED. So it has to be supplied at runtime.
export default {
	fetch: new CloudflareWrapper((body, init) => new Response(body, init)).wrap(diagnosticRouter())
};
