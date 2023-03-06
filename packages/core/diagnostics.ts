import http from 'http'
import { AgnosticRouter } from './src/common/AgnosticRouter'
import assert from 'node:assert/strict'
import { setTimeout } from 'timers/promises'

/** Used by the implementing router. */
export const diagnosticRouter = () => {
  const router = new AgnosticRouter()
  router.get('/', (req, res) => res.status(200).send('ok'))
  router.get('/diagnostic/{pathParam1}', async (req, res) => {
    const { method, path, headers, params, query, body } = req
    const { inheader1 } = headers
    res.headers.outheader1 = ['xxx', 'yyy']
    res.status(201)
    res.json({ method, path, headers: { inheader1 }, params, query, body })
  })
  return router
}

/** Promisified Http GET Request - no error handling */
export const httpGet = async (url: string, options: any = {}) => {
  return new Promise<[http.IncomingMessage, string | undefined]>((resolve) => {
    try {
      http
        .get(url, options, (res) => {
          const data: Buffer[] = []
          res.on('data', (chunk) => data.push(chunk))
          res.on('end', () => resolve([res as any, Buffer.concat(data).toString()]))
          res.on('error', (err) => {
            console.error(err.message)
            resolve([{ statusCode: -1 } as any, undefined])
          })
        })
        .on('error', (err) => {
          console.error(err.message)
          resolve([{ statusCode: -1 } as any, undefined])
        })
    } catch (err) {
      resolve([{ statusCode: -1 } as any, undefined])
    }
  })
}

/** Waits up to 2.5 seconds for server to return 200 status code */
export const waitForStartup = async (url: string, options: any = {}, maxIterations = 10) => {
  for (let i = 0; i < maxIterations; i++) {
    if ((await httpGet(url, options))[0].statusCode !== 200) {
      if (i === maxIterations - 1) throw new Error('Server not running')
      console.log('waiting for server to start...')
      await setTimeout(250)
    } else {
      break
    }
  }
}

/**
 * Used to verify the running router implementation.
 */
export const verifyByCallingRunningHttpServer = async (baseUrl: string = 'http://localhost:3000') => {
  const [res, data] = await httpGet(`${baseUrl}/diagnostic/abc?query1=123&query1=456`, {
    headers: { inheader1: 'aaa, bbb' }
  })

  // VERIFY GET

  // verify response
  assert.deepEqual(res.statusCode, 201, `Expected status code 201, got ${res.statusCode}`)
  console.log('\t✔ res status code')
  assert.deepEqual(
    res.headers.outheader1,
    'xxx, yyy',
    `Expected header outheader1 to be xxx, got ${res.headers.outheader1}`
  )
  console.log('\t✔ res headers')

  // verify body (request)
  const body = JSON.parse(data || '{}')
  assert.deepEqual(body.method, 'get', `Expected method get, got ${body.method}`)
  console.log('\t✔ req method')
  assert.deepEqual(
    body.path,
    '/diagnostic/abc?query1=123&query1=456',
    `Expected path /diagnostic/abc, got ${body.path}`
  )
  console.log('\t✔ req path')
  assert.deepEqual(
    body.headers.inheader1,
    ['aaa, bbb'],
    `Expected headers "['aaa', 'bbb']", got ${body.headers.inheader1}`
  )
  console.log('\t✔ req headers')
  assert.deepEqual(body.query.query1, ['123', '456'], `Expected query1 "['123', '456']", got ${body.query.query1}`)
  console.log('\t✔ req query')
  assert.deepEqual(body.params.pathParam1, 'abc', `Expected pathParam1 "abc", got ${body.params.pathParam1}`)
  console.log('\t✔ req path params')
}
