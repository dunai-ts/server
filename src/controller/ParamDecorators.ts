/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';
import { checkController } from './Common';

/**
 * Base function for param decorators
 * @private
 * @param type
 * @param key
 */
export function addControllerParamDecoration(type: string, key: string) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const target = checkController(controller);

        if (!(propertyKey in target._route_params))
            target._route_params[propertyKey] = [];

        target._route_params[propertyKey][index] = {
            type,
            key
        };
    };
}
