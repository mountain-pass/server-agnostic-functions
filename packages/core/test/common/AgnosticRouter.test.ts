import { expect } from 'chai'
import { describe, it, beforeEach } from 'mocha'
// import { serveStatic } from '../../src/common/HttpPathUtils'
import { HttpRequest } from '../../src/types/HttpRequest'
import { HttpResponse } from '../../src/types/HttpResponse'
import { buildRouter } from './fixtures/MySimpleApi'
import path from 'path'

describe('AgnosticRouter', () => {
  let router = buildRouter()

  beforeEach(() => {
    router = buildRouter()
  })

  describe('given the path "/users/{userId}"', () => {
    it('should handle valid requests', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/users/123' })
      const res = new HttpResponse()

      // invoke routes
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.equal('{"message":"hi","userId":"123"}')
    })

    it('should reject unknown requests', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/passwords' })
      const res = new HttpResponse()

      // invoke routes
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.equal(404)
      expect(res.body).to.equal('Not found')
    })

    it('should reject unhandled requests', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/users/123/nothandled' })
      const res = new HttpResponse()

      // invoke routes
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.equal(404)
      expect(res.body).to.equal('Not found')
    })

    it('middleware should be invoked in order', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/users/123' })
      const res = new HttpResponse()

      // invoke routes
      router.use(async (req, res) => {
        res.headers.middleware = ['1']
      })
      router.use(async (req, res) => {
        res.headers.middleware.push('2')
      })
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.eql(200)
      expect(res.headers.middleware).to.eql(['1', '2'])
      expect(res.body).to.eql('{"message":"hi","userId":"123"}')
    })

    it('if middleware ends the response, then no further processing occurs', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/users/123' })
      const res = new HttpResponse()

      // invoke routes
      router.use(async (req, res) => {
        res.status(401)
        res.send('User is not authorized')
      })
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.eql(401)
      expect(res.body).to.eql('User is not authorized')
    })

    it('if middleware throws an error, then no further processing occurs', async () => {
      // build request
      const req = HttpRequest.fromDefaults({ path: '/users/123' })
      const res = new HttpResponse()

      // invoke routes
      router.use(async () => {
        throw new Error('unexpected condition')
      })
      await router.handle(req, res)

      // verify response
      expect(res.statusCode).to.eql(500)
      expect(res.body).to.eql('Internal Server Error')
    })
  })

  describe.skip('serveStatic', () => {
    it('should be able to serve static dirs wip', async () => {
      // setup
      router.get('/static/(?<path>.*)', serveStatic(path.join(__dirname)))
      // /static
      const res1 = await router.handleRequestOnly(HttpRequest.fromDefaults({ path: '/static' }))
      expect(res1.statusCode).to.eql(404)
      // /static/
      const res2 = await router.handleRequestOnly(HttpRequest.fromDefaults({ path: '/static/' }))
      expect(res2.statusCode).to.eql(200)
      expect(JSON.parse(res2.body).length).to.eql(3)
      // /static/foo
      const res3 = await router.handleRequestOnly(HttpRequest.fromDefaults({ path: '/static/foo' }))
      expect(res3.statusCode).to.eql(404)
      // /static/fixtures/filelist
      const res4 = await router.handleRequestOnly(HttpRequest.fromDefaults({ path: '/static/fixtures/filelist' }))
      expect(res4.statusCode).to.eql(200)
      expect(JSON.parse(res4.body)).to.eql(['test.txt'])
      // /static/fixtures/filelist/test.txt
      const res5 = await router.handleRequestOnly(
        HttpRequest.fromDefaults({ path: '/static/fixtures/filelist/test.txt' })
      )
      expect(res5.statusCode).to.eql(200)
      expect(res5.body).to.eql('some content')
    })
  })
})
