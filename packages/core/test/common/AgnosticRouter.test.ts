import { expect } from 'chai';
import { describe, it } from 'mocha';
import { AgnosticRouter, HttpMethod } from '../../src/common/AgnosticRouter';
import { HttpRequest } from '../../src/types/HttpRequest';
import { HttpResponse } from '../../src/types/HttpResponse';

const newRequest = (method: string, path: string, body: string) => {
    const req = new HttpRequest()
    req.method = method.toLowerCase() as HttpMethod
    req.path = path
    req.body = body
    return req
}

describe('AgnosticRouter', () => {

    describe('given the path "/users/{userId}"', () => {

        const router = new AgnosticRouter()

        // one route only
        router.get('/users/{userId}', (req, res) => {
            res.json({ message: 'hi', ...req.params })
        })

        it('should handle valid requests', async () => {
            const req = newRequest('get', '/users/123', '{}')
            const res = new HttpResponse()
            await router.handle(req, res)
            expect(res.statusCode).to.equal(200)
            expect(res.data).to.equal('{"message":"hi","userId":"123"}')
        })

        it('should reject invalid requests', async () => {
            const req = newRequest('get', '/passwords', '{}')
            const res = new HttpResponse()
            await router.handle(req, res)
            expect(res.statusCode).to.equal(404)
            expect(res.data).to.equal('Not found')
        })

    })

});