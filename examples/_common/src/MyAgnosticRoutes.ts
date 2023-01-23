import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

const router = new AgnosticRouter()

router.get('/', (req, res) => {
  res.headers.Location = '/hello?name=bob'
  res.status(307)
  res.send('')
})

router.get('/hello', (req, res) => {
  res.send(`hello ${req.query.name[0] || req.params.name || 'world'}`)
})

router.post('/upload', (req, res) => {
  res.json(req)
})

export default router
