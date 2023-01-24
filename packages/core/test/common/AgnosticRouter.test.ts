import { expect } from 'chai';
import { describe, it } from 'mocha';
import { HttpRequest } from '../../src/types/HttpRequest';
import { HttpResponse } from '../../src/types/HttpResponse';
import { router } from './fixtures/MySimpleApi';

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

    })

});