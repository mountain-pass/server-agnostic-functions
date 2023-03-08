import { AgnosticRouter, HttpRequest, HttpResponse } from '@mountainpass/server-agnostic-functions-core'

/** Used by the implementing router. */

/**
 * A sample router, for testing that provider implementations handle mappings consistently.
 * get: [],
 * post: [],
 * put: [],
 * delete: [],
 * patch: [],
 * head: [],
 * options: [],
 * connect: [],
 * trace: []
 * @returns
 *
 */
export function diagnosticRouter() {
  const router = new AgnosticRouter()

  // for detecting when the server is available
  router.get('/status', (req: HttpRequest, res: HttpResponse) => res.status(200).send('ok'))

  // for testing the router's GET implementation
  router.get('/diagnostic/{pathParam1}', async (req: HttpRequest, res: HttpResponse) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['x1', 'y1']
    res.status(201)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })

  // for testing the router's POST implementation
  router.post('/diagnostic/{pathParam1}', async (req: HttpRequest, res: HttpResponse) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['x2', 'y2']
    res.status(202)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })

  // for testing the router's PUT implementation
  router.put('/diagnostic/{pathParam1}', async (req: HttpRequest, res: HttpResponse) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['x3', 'y3']
    res.status(201)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })

  // for testing the router's PUT implementation
  router.patch('/diagnostic/{pathParam1}', async (req: HttpRequest, res: HttpResponse) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['x4', 'y4']
    res.status(202)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })

  // for testing the router's PUT implementation
  router.delete('/diagnostic/{pathParam1}', async (req: HttpRequest, res: HttpResponse) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['x5', 'y5']
    res.status(201)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })

  return router
}
