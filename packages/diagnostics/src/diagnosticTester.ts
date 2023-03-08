import http from 'axios'
import deepEqual from 'deep-equal'

const assertDeepEqual = (actual: any, expected: any, additionalInfo: any = '') => {
  if (!deepEqual(actual, expected))
    throw new Error(
      `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)} - ${JSON.stringify(additionalInfo)}`
    )
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

const verifyGet = async (baseUrl: string = DEFAULT_HOST) => {
  const res = await http.get(`${baseUrl}/diagnostic/abc?query1=123&query1=456`, {
    headers: { inheader1: 'aaa, bbb' }
  })

  console.log('\t[verifying GET]')

  // verify response
  assertDeepEqual(res.status, 201)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'x1,y1')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'get', body)
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/abc', body)
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'], body)
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'], body)
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'abc', body)
  console.log('\t✔ req path params')
  assertDeepEqual(body.body, undefined, body)
  console.log('\t✔ req body')
}

const verifyPost = async (baseUrl: string = DEFAULT_HOST) => {
  const res = await http.post(
    `${baseUrl}/diagnostic/def?query1=123&query1=456`,
    { foo: { bar: [1, 'a', true] } },
    { headers: { inheader1: 'aaa, bbb' } }
  )

  console.log('\t[verifying POST]')

  // verify response
  assertDeepEqual(res.status, 202)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'x2,y2')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'post', body)
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/def', body)
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'], body)
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'], body)
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'def', body)
  console.log('\t✔ req path params')
  assertDeepEqual(body.body, '{"foo":{"bar":[1,"a",true]}}', body)
  console.log('\t✔ req body')
}

const verifyPut = async (baseUrl: string = DEFAULT_HOST) => {
  const res = await http.put(
    `${baseUrl}/diagnostic/ghi?query1=123&query1=456`,
    { foo: { bar: [1, 'a', true] } },
    { headers: { inheader1: 'aaa, bbb' } }
  )

  console.log('\t[verifying PATCH]')

  // verify response
  assertDeepEqual(res.status, 201)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'x3,y3')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'put', body)
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/ghi', body)
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'], body)
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'], body)
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'ghi', body)
  console.log('\t✔ req path params')
  assertDeepEqual(body.body, '{"foo":{"bar":[1,"a",true]}}', body)
  console.log('\t✔ req body')
}

const verifyPatch = async (baseUrl: string = DEFAULT_HOST) => {
  const res = await http.patch(
    `${baseUrl}/diagnostic/jkl?query1=123&query1=456`,
    { foo: { bar: [1, 'a', true] } },
    { headers: { inheader1: 'aaa, bbb' } }
  )

  console.log('\t[verifying PATCH]')

  // verify response
  assertDeepEqual(res.status, 202)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'x4,y4')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'patch', body)
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/jkl', body)
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'], body)
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'], body)
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'jkl', body)
  console.log('\t✔ req path params')
  assertDeepEqual(body.body, '{"foo":{"bar":[1,"a",true]}}', body)
  console.log('\t✔ req body')
}

const verifyDelete = async (baseUrl: string = DEFAULT_HOST) => {
  const res = await http.delete(`${baseUrl}/diagnostic/mno?query1=123&query1=456`, {
    headers: { inheader1: 'aaa, bbb' }
  })

  console.log('\t[verifying DELETE]')

  // verify response
  assertDeepEqual(res.status, 201)
  console.log('\t✔ res status code')
  assertDeepEqual(res.headers.outheader1.replace(/\s+/g, ''), 'x5,y5')
  console.log('\t✔ res headers')

  // verify body (request)
  const body = res.data
  assertDeepEqual(body.method, 'delete', body)
  console.log('\t✔ req method')
  assertDeepEqual(body.path, '/diagnostic/mno', body)
  console.log('\t✔ req path')
  assertDeepEqual(body.headers.inheader1, ['aaa, bbb'], body)
  console.log('\t✔ req headers')
  assertDeepEqual(body.query.query1, ['123', '456'], body)
  console.log('\t✔ req query')
  assertDeepEqual(body.params.pathParam1, 'mno', body)
  console.log('\t✔ req path params')
  assertDeepEqual(body.body, undefined, body)
  console.log('\t✔ req body')
}

/**
 * Used to verify the running router implementation.
 */
export const verifyByCallingRunningHttpServer = async (maxIterations = 10, baseUrl: string = DEFAULT_HOST) => {
  await waitForStartup(maxIterations, `${baseUrl}/status`, {}, 200)
  await verifyGet(baseUrl)
  await verifyPost(baseUrl)
  await verifyPut(baseUrl)
  await verifyPatch(baseUrl)
  await verifyDelete(baseUrl)
}
