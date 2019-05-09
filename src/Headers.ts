/**
 * @module @dunai/server
 */
import { onErrorMiddleware } from './Common';

// import { IncomingHttpHeaders } from 'http';
//
// export type IHeaders = IncomingHttpHeaders;

// export class Headers {
//     constructor(headers: IncomingHttpHeaders) {
//     }
//
//     get(name: string): string;
//
//     set(name: string, value: string): void;
// }

export function changeHeadersBeforeSendMiddleware(fn) {
    return (req, res, next) => {
        const original = res.end;
        function headers_hook() {
            res.end = original;
            if (!res.headersSent) {
                try {
                    fn(req, res);
                } catch (e) {
                    return onErrorMiddleware(e, req, res);
                }
                if (res.headersSent) {
                    console.error('sending response while in mung.headers is undefined behaviour');
                    return;
                }
            }
            return original.apply(this, arguments);
        }
        res.end = headers_hook;

        if (next) next();
    };
}
