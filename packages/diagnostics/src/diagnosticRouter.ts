import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

/** Used by the implementing router. */

export function diagnosticRouter() {
  const router = new AgnosticRouter()
  router.get('/status', (req, res) => res.status(200).send('ok'))
  router.get('/diagnostic/{pathParam1}', async (req, res) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['xxx', 'yyy']
    res.status(201)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })
  return router
}
