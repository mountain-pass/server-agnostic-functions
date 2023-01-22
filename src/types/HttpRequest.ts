import { HttpMethod } from "../common/AgnosticRouter";
import { KeyValueArrayMap, KeyValueMap, nonenumerable } from "./HttpTypes";


/**
 * Generic representation of a Http Request.
 */
export default class HttpRequest<UnderlyingRequest = any> {

    static from = (method: HttpMethod, path: string = '/', data: string = '') => {
        const req = new HttpRequest();
        req.method = method;
        req.path = path;
        req.body = data;
        return req;
    };

    /** Value is lower cased. */
    method: HttpMethod;
    path: string;
    /** Keys are lower cased. */
    headers: KeyValueArrayMap = {};
    params: KeyValueMap = {};
    query: KeyValueArrayMap = {};
    body: string = '';
    
    /**
     * Provides access to the underlying request object.
     */
    @nonenumerable
    underlying?: UnderlyingRequest;
    json = () => typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
}
