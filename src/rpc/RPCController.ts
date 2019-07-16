/**
 * @module @dunai/server
 */

import { GenericClassDecorator, Injector, Type } from '@dunai/core';
import { RPCControllerOptions } from './RPCManager.interface';

export const RPC_CONTROLLER_REFLECT_KEY = 'RPCController';

/**
 * Decorate class as RPC controller
 * @decorator
 * @param name
 */
export function RPCController(
    name: string = '',
    options?: RPCControllerOptions,
): GenericClassDecorator<Type<any>> {
    return (target: any) => {
        Injector.registerService(target);
        Reflect.defineMetadata(RPC_CONTROLLER_REFLECT_KEY, options || {}, target);
        return target;
    };
}
