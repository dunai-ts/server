import { addControllerParamDecoration } from '../controller/ParamDecorators';

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
    return addControllerParamDecoration(ROUTE_PATH_PARAM, key);
}

/**
 * Get parameter from query
 *
 * If call without parameters return all query parameters
 * @param key
 * @decorator
 */
export function Query(key?: string) {
    return addControllerParamDecoration(ROUTE_QUERY_PARAM, key);
}


/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Body(key?: string) {
    return addControllerParamDecoration(ROUTE_BODY_PARAM, key);
}
