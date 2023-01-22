import { expect } from 'chai';
import { describe, it } from 'mocha';
import { AgnosticRouter } from '../../src/common/AgnosticRouter';
import HttpRequest from '../../src/types/HttpRequest';
import HttpResponse from '../../src/types/HttpResponse';


describe('AgnosticRouter', () => {

    describe('given the path "/users/{userId}"', () => {

        const router = new AgnosticRouter()

        // one route only
        router.get('/users/{userId}', (req, res) => {
            res.json({ message: 'hi', ...req.params })
        })

        it('should handle valid requests', async () => {
            const req = HttpRequest.from('get', '/users/123', '{}')
            const res = new HttpResponse()
            await router.handle(req, res)
            expect(res.statusCode).to.equal(200)
            expect(res.data).to.equal('{"message":"hi","userId":"123"}')
        })

        it('should reject invalid requests', async () => {
            const req = HttpRequest.from('get', '/passwords', '{}')
            const res = new HttpResponse()
            await router.handle(req, res)
            expect(res.statusCode).to.equal(404)
            expect(res.data).to.equal('Not found')
        })

    })

});