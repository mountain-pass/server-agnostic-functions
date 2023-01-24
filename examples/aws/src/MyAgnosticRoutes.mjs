import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

export const router = new AgnosticRouter()

router.get('/api/', (req, res) => {
  res.headers.Location = '/api/hello?name=bob'
  res.status(307)
  res.send('')
})

router.get('/api/hello', (req, res) => {
  res.send(`hello ${req.query.name || req.params.name || 'world'}`)
})

router.post('/api/upload', (req, res) => {
  res.json(req)
})
