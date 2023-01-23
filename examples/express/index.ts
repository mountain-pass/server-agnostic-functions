import { AgnosticRouter } from '@mountainpass_oss/server-agnostic-functions'
import { wrap } from '@mountainpass_oss/server-agnostic-functions/dist/ExpressWrapper'
import express from 'express'

const router = new AgnosticRouter()

router.get('/hello', (req, res) => {
    
  res.send(`hello ${req.query.name || 'world'}`)
})

// wrap the router in an express app
const app = express()
app.use(wrap(express.Router(), router))
app.listen(3000, () => console.log('listening on port 3000'))
