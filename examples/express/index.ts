
import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import { wrap } from '@mountainpass_oss/server-agnostic-functions/src/providers/ExpressWrapper'
import express from 'express'

// wrap the router in an express app
const app = express()
app.use(wrap(express.Router(), MyAgnosticRoutes))
app.listen(8787, () => console.log('listening on port 8787 - Start here -> http://localhost:8787/hello?name=bob'))
