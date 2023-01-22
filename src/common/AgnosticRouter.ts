import { convertToRegexMatcher, parsePathParams } from "./HttpPathUtils"
import HttpResponse from "../types/HttpResponse"
import HttpRequest from "../types/HttpRequest"

/**
 * Handler for a Http Request.
 */
export type RouteHandler = (req: HttpRequest, res: HttpResponse) => Promise<void> | void

/* Types for handling Routes. */

export type RegexToRouteTuple = { key: RegExp, value: RouteHandler }
export type RegexRoutes = RegexToRouteTuple[]
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'connect' | 'trace'
export type HttpMethodLookup = { [key in HttpMethod]: RegexRoutes }

/**
 * A generic HttpRequest Router.
 */
export class AgnosticRouter<UnderlyingRequest = any, UnderlyingResponse = any> {

    routes: HttpMethodLookup = {
        get: [],
        post: [],
        put: [],
        delete: [],
        patch: [],
        head: [],
        options: [],
        connect: [],
        trace: [],
    }

    get = (path: string, handler: RouteHandler) => {
        this.routes.get.push({ key: convertToRegexMatcher(path), value: handler })
    }

    post = (path: string, handler: RouteHandler) => {
        this.routes.post.push({ key: convertToRegexMatcher(path), value: handler })
    }

    put = (path: string, handler: RouteHandler) => {
        this.routes.put.push({ key: convertToRegexMatcher(path), value: handler })
    }

    delete = (path: string, handler: RouteHandler) => {
        this.routes.delete.push({ key: convertToRegexMatcher(path), value: handler })
    }

    patch = (path: string, handler: RouteHandler) => {
        this.routes.patch.push({ key: convertToRegexMatcher(path), value: handler })
    }

    head = (path: string, handler: RouteHandler) => {
        this.routes.head.push({ key: convertToRegexMatcher(path), value: handler })
    }

    options = (path: string, handler: RouteHandler) => {
        this.routes.options.push({ key: convertToRegexMatcher(path), value: handler })
    }

    connect = (path: string, handler: RouteHandler) => {
        this.routes.connect.push({ key: convertToRegexMatcher(path), value: handler })
    }

    trace = (path: string, handler: RouteHandler) => {
        this.routes.trace.push({ key: convertToRegexMatcher(path), value: handler })
    }

    /**
     * Handles the routing of the request.
     * @param req 
     * @param res 
     * @returns 
     */
    handle = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
        console.log(`req: ${req.method} ${req.path}`)
        const route = this.routes[req.method].find(({ key: regex }) => {
            // matches, add path params and return true
            if (regex.test(req.path)) {
                req.params = { ...req.params, ...parsePathParams(req.path, regex) }
                return true
            }
        })
        if (route) {
            await route.value(req, res)
        } else {
            res.status(404).send('Not found')
        }
    }
}