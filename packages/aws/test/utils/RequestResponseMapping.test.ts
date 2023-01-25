import { expect } from 'chai'
import { describe, it } from 'mocha'
import eventV1 from './fixtures/APIGatewayProxyEventV1.sample.json'
import eventV2 from './fixtures/APIGatewayProxyEventV2.sample.json'
import httpResponse from './fixtures/HttpResponse.sample.json'
import { AwsRequest, mapRequest, mapResponse } from '../../src/utils/RequestResponseMapping'
import { Context } from 'aws-lambda'
import { HttpResponse } from '@mountainpass/server-agnostic-functions-core'

describe('RequestResponseMapping', () => {

    describe('request', () => {

        it('a APIGatewayProxyEventV1 should be converted to a HttpRequest', () => {
            const context = { foo: 'bar' } as unknown as Context
            const request = mapRequest<AwsRequest>(eventV1, context)
            expect(request.method).to.equal('post')
            expect(request.path).to.equal('/api/upload')
            expect(request.body).to.equal('{ "name": "fred" }')
            expect(request.headers).to.deep.equal({
              accept: ['*/*'],
              'content-length': ['18'],
              'content-type': ['application/json'],
              host: ['localhost:3000'],
              'user-agent': ['curl/7.79.1'],
              'x-forwarded-port': ['3000'],
              'x-forwarded-proto': ['http']
            })
            expect(request.query).to.deep.equal({ name: [ 'bob', 'fred' ] })
            expect(request.params).to.deep.equal({ anyPath: 'api/upload' })
            expect(request.underlying?.event).to.equal(eventV1)
            expect(request.underlying?.context).to.equal(context)
          })
        
          it('a APIGatewayProxyEventV2 should be converted to a HttpRequest', () => {
            const context = { foo: 'bar' } as unknown as Context
            const request = mapRequest<AwsRequest>(eventV2, context)
            expect(request.method).to.equal('post')
            expect(request.path).to.equal('/api/upload')
            expect(request.body).to.equal('{ "name": "fred" }')
            expect(request.headers).to.deep.equal({
              accept: ['*/*'],
              'content-length': ['18'],
              'content-type': ['application/json'],
              host: ['localhost:3000'],
              'user-agent': ['curl/7.79.1'],
            })
            expect(request.query).to.deep.equal({ name: [ 'bob', 'fred' ] })
            expect(request.params).to.deep.equal({ default: 'api/upload' })
            expect(request.underlying?.event).to.equal(eventV2)
            expect(request.underlying?.context).to.equal(context)
          })
    })

    describe('response', () => {

        it('a HttpResponse should be converted to a APIGatewayProxyResult', () => {
            const response = mapResponse(httpResponse as unknown as HttpResponse)
            expect(response.statusCode).to.equal(200)
            expect(response.body).to.equal('{ "message": "Hello World!" }')
            expect(response.multiValueHeaders).to.deep.equal({
                "Content-Type": ["application/json"],
                "Access-Control-Allow-Origin": ["*"],
                "Access-Control-Allow-Credentials": [true],
                "ETag": ["abcd"]
              })
          })
        
    })

})
