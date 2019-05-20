/**
 * @module @dunai/server
 */

import { RouteMeta } from './router/Common';

/**
 * Error on resolve entity
 */
export interface EntityError extends Error {
    meta: RouteMeta;
    params: any[];
}

export function onErrorMiddleware(err, req, res) {
    res.status(500)
       .set('content-language', 'en')
       .json({ message: err.message })
       .end();
    return res;
}
