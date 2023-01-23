import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import { wrap } from '@mountainpass_oss/server-agnostic-functions/src/providers/CloudflareWrapper'

export interface Env {
}

export default {
	fetch: wrap<Env>(MyAgnosticRoutes)
};
