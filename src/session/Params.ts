import { addControllerParamDecoration } from '../ParamDecoration';
import { IDecoratedParamHttpResolveData } from '../router/Common';

export const CONTROLLER_SESSION_PARAM = 'session';

/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Session(key?: string) {
    return addControllerParamDecoration({
        type       : CONTROLLER_SESSION_PARAM,
        useFunction: (data: IDecoratedParamHttpResolveData, req: Request) => key ? req['session'][key] : req['session']
    });
}
