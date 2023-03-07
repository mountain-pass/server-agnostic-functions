
import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-diagnostics'
import { ExpressWrapper } from '@mountainpass/server-agnostic-functions-express'
import express from 'express'

const app = express()
app.use(new ExpressWrapper().wrap(diagnosticRouter()))
app.listen(3000, () => console.log('listening on port 3000'))
