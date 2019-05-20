import { addControllerParamDecoration } from '../controller/ParamDecorators';

export const CONTROLLER_SESSION_PARAM = 'session';

/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Session(key?: string) {
    return addControllerParamDecoration(CONTROLLER_SESSION_PARAM, key);
}
