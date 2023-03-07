import http from 'axios'
import deepEqual from 'deep-equal'

const assertDeepEqual = (actual: any, expected: any) => {
  if (!deepEqual(actual, expected))
    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_HOST = 'http://127.0.0.1:3000'

/** Waits up to 2.5 seconds for server to return 200 status code */
export const waitForStartup = async (
  maxIterations = 10,
  url: string = DEFAULT_HOST,
  options: any = {},
  expectedStatusCode = 200
) => {
  for (let i = 0; i < maxIterations; i++) {
    try {
      const res = await http.get(url, options)
      if (res.status === expectedStatusCode) {
        console.log(`received ${res.status} from ${url}`)
        break
      }
    } catch (err: any) {
      console.error(`Suppressing http error: ${err.message}`)
    }
    if (i === maxIterations - 1) throw new Error('Server not running')
    console.log(`waiting for server to start... ${i + 1}`)
    await sleep(500)
  }
}

/**
 * Used to verify the running router implementation.
 */
export const verifyByCallingRunningHttpServer = async (maxIterations = 10, baseUrl: string = DEFAULT_HOST) => {
  await waitForStartup(maxIterations, `${baseUrl}/status`, {}, 200)

  const res = await http.get(`${baseUrl}/diagnostic/abc?query1=123&query1=456`, {
    headers: { inheader1: 'aaa, bbb' }
  })

  // VERIFY GET

  // verify response
  assertDeepEqual(res.status, 201)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'xxx,yyy')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'get')
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/abc')
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'])
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'])
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'abc')
  console.log('\t✔ req path params')
}
