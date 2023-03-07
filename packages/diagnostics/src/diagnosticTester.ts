import http from 'http'
import assert from 'node:assert/strict'
import { setTimeout } from 'timers/promises'

const DEFAULT_HOST = 'http://127.0.0.1:3000'

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
export const waitForStartup = async (
  maxIterations = 10,
  url: string = DEFAULT_HOST,
  options: any = {},
  expectedStatusCode = 200
) => {
  for (let i = 0; i < maxIterations; i++) {
    const [res] = await httpGet(url, options)
    if (res.statusCode !== expectedStatusCode) {
      if (i === maxIterations - 1) throw new Error('Server not running')
      console.log(`waiting for server to start... ${i + 1}`)
      await setTimeout(500)
    } else {
      console.log(`received ${res.statusCode} from ${url}`)
      break
    }
  }
}

/**
 * Used to verify the running router implementation.
 */
export const verifyByCallingRunningHttpServer = async (maxIterations = 10, baseUrl: string = DEFAULT_HOST) => {
  await waitForStartup(maxIterations, `${baseUrl}/status`, {}, 200)

  const [res, data] = await httpGet(`${baseUrl}/diagnostic/abc?query1=123&query1=456`, {
    headers: { inheader1: 'aaa, bbb' }
  })

  // VERIFY GET

  // verify response
  assert.deepEqual(res.statusCode, 201)
  console.log('\t✔ res status code')
  assert.deepEqual(res.headers.outheader1, 'xxx, yyy')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = JSON.parse(data || '{}')
  assert.deepEqual(body.method, 'get')
  console.log('\t✔ req method')
  assert.deepEqual(body.path, '/diagnostic/abc')
  console.log('\t✔ req path')
  assert.deepEqual(body.headers.inheader1, ['aaa, bbb'])
  console.log('\t✔ req headers')
  assert.deepEqual(body.query.query1, ['123', '456'])
  console.log('\t✔ req query')
  assert.deepEqual(body.params.pathParam1, 'abc')
  console.log('\t✔ req path params')
}
