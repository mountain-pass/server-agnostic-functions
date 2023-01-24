// NOTE running locally can't see locally imported packages - probably because it's running inside a docker container.
// import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import AwsWrapper from '@mountainpass/server-agnostic-functions-aws'
import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

// workaround start (see above)

const router = new AgnosticRouter()

router.get('/api/root', (req, res) => {
  res.headers.Location = '/api/hello?name=bob'
  res.status(307)
  res.send('')
})

router.get('/api/hello', (req, res) => {
  res.send(`hello ${req.query.name || req.params.name || 'world'}`)
})

router.post('/api/upload', (req, res) => {
  // res.json(req)
  res.send('hello uploader')
})

// workaround end

export const handler = AwsWrapper.wrap(router)
