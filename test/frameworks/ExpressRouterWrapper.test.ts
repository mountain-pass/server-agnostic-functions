import { expect } from 'chai';
import express, { Response, Router } from 'express';
import { describe, it } from 'mocha';
import request from 'supertest';
import { AgnosticRouter } from '../../src/common/AgnosticRouter';
import { wrap } from '../../src/providers/ExpressWrapper';


describe('ExpressWrapper', () => {

    describe('given the path "/users/{userId}"', () => {

        // setup a routes to check that requests/responses are passed correctly
        const router = new AgnosticRouter()
        router.get('/users/{userId}', (req, res) => {
            // verify the underlying objects are initialised correctly
            expect(typeof req.underlying).to.equal('object')
            expect(typeof res.underlying).to.equal('object')
            res.headers.Cookie = 'get_monster'
            res.status(200)
            res.json(req)
        })
        router.post('/users/{userId}', (req, res) => {
            res.headers.Cookie = 'post_monster'
            res.status(201)
            res.json(req)
        })
        router.put('/users/{userId}', (req, res) => {
            res.headers.Cookie = 'post_monster'
            res.status(201)
            res.json(req)
        })

        // test the express router wrapper
        const app = express()
        app.use(wrap(express.Router(), router))
        // app.use(express.json()) // NOTE json parsing is disabled!

        it('should parse a GET Request successfully', async () => {
            const response = await request(app)
                .get('/users/123?foo=bar1&foo=bar2')
                .set('Cookie', 'foobar')
                .send({ name: "new_org" })
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.status).to.equal(200)
            expect(response.body?.method).to.equal('get')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            // NOTE no data expected, this is a GET request
        })

        it('should parse a POST Request successfully', async () => {
            const response = await request(app)
                .post('/users/123?foo=bar1&foo=bar2')
                .send({ name: "new_org" })
                .set('Cookie', 'foobar')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.body?.method).to.equal('post')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            expect(response.body?.body).to.equal('{"name":"new_org"}')
        })

        it('should parse a PUT Request successfully', async () => {
            const response = await request(app)
                .put('/users/123?foo=bar1&foo=bar2')
                .send({ name: "new_org" })
                .set('Cookie', 'foobar')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.body?.method).to.equal('put')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            expect(response.body?.body).to.equal('{"name":"new_org"}')
        })

        it('should parse a GET Response successfully', async () => {
            const response = await request(app)
                .get('/users/123?foo=bar1&foo=bar2')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.status).to.equal(200)
            expect(response.headers.cookie).to.equal('get_monster')
        })

    })

    describe('given the path "/users/{userId}" (JSON parsing enabled!)', () => {

        // setup a routes to check that requests/responses are passed correctly
        const router = new AgnosticRouter()
        
        router.get('/users/{userId}', (req, res) => {
            res.headers.Cookie = 'get_monster'
            res.status(200)
            res.json(req)
        })
        router.post('/users/{userId}', (req, res) => {
            res.headers.Cookie = 'post_monster'
            res.status(201)
            res.json(req)
        })
        router.put('/users/{userId}', (req, res) => {
            res.headers.Cookie = 'post_monster'
            res.status(201)
            res.json(req)
        })

        const app = express()
        app.use(express.json()) // NOTE json parsing is enabled!
        app.use(wrap(express.Router(), router))

        it('should parse a GET Request successfully', async () => {
            const response = await request(app)
                .get('/users/123?foo=bar1&foo=bar2')
                .set('Cookie', 'foobar')
                .send({ name: "new_org" })
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.status).to.equal(200)
            expect(response.body?.method).to.equal('get')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            // NOTE no data expected, this is a GET request
        })

        it('should parse a POST Request successfully', async () => {
            const response = await request(app)
                .post('/users/123?foo=bar1&foo=bar2')
                .send({ name: "new_org" })
                .set('Cookie', 'foobar')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.body?.method).to.equal('post')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            // NOTE the body is parsed as JSON
            expect(response.body?.body).to.deep.equal({ name: 'new_org' })
        })

        it('should parse a PUT Request successfully', async () => {
            const response = await request(app)
                .put('/users/123?foo=bar1&foo=bar2')
                .send({ name: "new_org" })
                .set('Cookie', 'foobar')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.body?.method).to.equal('put')
            expect(response.body?.path).to.equal('/users/123?foo=bar1&foo=bar2')
            expect(response.body?.query).to.deep.equal({ foo: ['bar1', 'bar2'] })
            expect(response.body?.params).to.deep.equal({ userId: '123' })
            expect(response.body?.headers?.cookie).to.deep.equal(['foobar'])
            // NOTE the body is parsed as JSON
            expect(response.body?.body).to.deep.equal({ name: 'new_org' })
        })

        it('should parse a GET Response successfully', async () => {
            const response = await request(app)
                .get('/users/123?foo=bar1&foo=bar2')
            // typeof response is express.Response
            expect(response.constructor.name).to.equal('Response')
            expect(response.status).to.equal(200)
            expect(response.headers.cookie).to.equal('get_monster')
        })

    })

});