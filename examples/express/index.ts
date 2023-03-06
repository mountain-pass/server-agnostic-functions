
import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-core'
import { ExpressWrapper } from '@mountainpass/server-agnostic-functions-express'
import express from 'express'

const app = express()
const wrapper = new ExpressWrapper()
const router = diagnosticRouter()
app.use(wrapper.wrap(router))
app.listen(3000, () => console.log('listening on port 3000'))
