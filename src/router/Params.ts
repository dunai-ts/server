import { Request } from '../Interfaces';
import { addControllerParamDecoration } from '../ParamDecoration';
import { IDecoratedParamHttpResolveData } from './Common';

export const ROUTE_PATH_PARAM = 'path';
export const ROUTE_QUERY_PARAM = 'query';
export const ROUTE_BODY_PARAM = 'body';

/**
 * Get parameter from path
 *
 * If call without parameters return all path parameters
 * @param key
 * @decorator
 */
export function Path(key?: string) {
    return addControllerParamDecoration({
        type       : ROUTE_PATH_PARAM,
        useFunction: (data: IDecoratedParamHttpResolveData, req: Request) => {
            console.log('path', key, 'from', req.params);
            return key ? req.params[key] : req.params
        }
    });
}

/**
 * Get parameter from query
 *
 * If call without parameters return all query parameters
 * @param key
 * @decorator
 */
export function Query(key?: string) {
    return addControllerParamDecoration({
        type       : ROUTE_QUERY_PARAM,
        useFunction: (data: IDecoratedParamHttpResolveData, req: Request) => key ? req.query[key] : req.query
    });
}


/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Body(key?: string) {
    return addControllerParamDecoration({
        type       : ROUTE_BODY_PARAM,
        useFunction: (data: IDecoratedParamHttpResolveData, req: Request) => key ? req.body[key] : req.body
    });
}
