/**
 * @module @dunai/server
 */

import { addControllerParamDecoration } from '@dunai/core';
import { IPayload } from './RPCManager.interface';

export const RPC_METHOD_PARAM = 'PARAM';

/**
 * Get parameter from path
 *
 * If call without parameters return all path parameters
 * @param key
 * @decorator
 */
export function Param(key?: string) {
    return addControllerParamDecoration({
        type       : RPC_METHOD_PARAM,
        useFunction: (data: IPayload) => {
            return key ? data[key] : data;
        },
    });
}
