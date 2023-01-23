
import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import ExpressWrapper from '@mountainpass_oss/server-agnostic-functions/dist/ExpressWrapper'
import express from 'express'

// wrap the router in an express app
const app = express()
app.use(ExpressWrapper.wrap(express.Router(), MyAgnosticRoutes))
app.listen(8787, () => console.log('listening on port 8787 - Start here -> http://localhost:8787/hello?name=bob'))
