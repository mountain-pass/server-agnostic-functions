import { expect } from 'chai'
import { describe, it } from 'mocha'
import { HttpRequest } from '../../src/types/HttpRequest'
import { HttpResponse } from '../../src/types/HttpResponse'
import { router } from './fixtures/MySimpleApi'

describe('AgnosticRouter', () => {
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
  })
})
