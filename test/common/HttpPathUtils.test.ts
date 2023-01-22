import { expect } from 'chai';
import { describe, it } from 'mocha'
import { convertToRegexMatcher, parsePathParams } from '../../src/common/HttpPathUtils';

type StringAny = [string, any]

describe('HttpPathUtils', () => {

    describe('given the path "/users/{userId}"', () => {
        const regex = convertToRegexMatcher('/users/{userId}')

        const shouldMatch: StringAny[] = [
            ['/users/123', { userId: '123' }],
            ['/users/abc', { userId: 'abc' }],
            ['/users/abc?foo=bar', { userId: 'abc' }],
        ]
        const shouldNotMatch = [
            '/',
            '/users',
            '/users/',
            '/users/123/',
            '/users/123/abc',
            '/users/123/abc/',
        ]

        shouldMatch.forEach(([path, expected]) => {
            it(`should match "${path}"`, () => {
                expect(regex.test(path)).to.equal(true)
                expect(parsePathParams(path, regex)).to.deep.equal(expected)
            });
        })
        shouldNotMatch.forEach(path => {
            it(`should not match "${path}"`, () => {
                expect(regex.test(path)).to.not.equal(true)
            });
        })
    })

    describe('given the path "/users/{userId}/foo/{bar}"', () => {
        const regex = convertToRegexMatcher('/users/{userId}/foo/{bar}')

        const shouldMatch: StringAny[] = [
            ['/users/123/foo/cat', { userId: '123', bar: 'cat' }],
            ['/users/abc/foo/dog', { userId: 'abc', bar: 'dog' }],
        ]
        const shouldNotMatch = [
            '/users/123/abc',
            '/users/123/abc/',
            '/users/123/abc/cat/',
            '/users/123/abc/cat/def',
        ]

        shouldMatch.forEach(([path, expected]) => {
            it(`should match "${path}"`, () => {
                expect(regex.test(path), regex.toString()).to.equal(true)
                expect(parsePathParams(path, regex)).to.deep.equal(expected)
            });
        })
        shouldNotMatch.forEach(path => {
            it(`should not match "${path}"`, () => {
                expect(regex.test(path)).to.not.equal(true)
            });
        })
    })
});