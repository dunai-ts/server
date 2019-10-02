/**
 * @module @dunai/server
 */

import { GenericClassDecorator, Injector, Type } from '@dunai/core';
import { RPCControllerOptions } from './RPCManager.interface';

export const RPC_METADATA = 'dunai:rpc:metadata';

export interface IRpcControllerMetadata {
    methods: { [method: string]: string };
    options: RPCControllerOptions;
}

/**
 * Decorate class as RPC controller
 * @decorator
 */
export function RPCController(
    name: string = '',
    options?: RPCControllerOptions,
): GenericClassDecorator<Type<any>> {
    return (target: any) => {
        Injector.registerService(target);

        const metadata: IRpcControllerMetadata = {
            methods: {},
            options: {
                prefix: '',
                ...options,
            },
        };

        const proto = target.prototype;

        const inherit = getInheritMetadata(proto);

        const methods = { ...inherit.methods };
        Object.getOwnPropertyNames(proto).forEach(key => {
            const method: string | string[] = Reflect.getMetadata('method', proto, key);
            if (!method)
                return;

            Object.keys(methods).forEach(existMethod => {
                if (methods[existMethod] === key)
                    delete methods[existMethod];
            });

            if (Array.isArray(method))
                method.forEach(m => methods[m] = key);
            else
                methods[method] = key;
        });

        metadata.methods = methods;

        Reflect.defineMetadata(RPC_METADATA, metadata, target);
        Reflect.defineMetadata(RPC_METADATA, metadata, target.prototype);

        return target;
    };
}

function getInheritMetadata(instance: any): IRpcControllerMetadata {
    const keys = {};

    let metadata = null;

    for (let obj = instance;
         obj;
         obj = Object.getPrototypeOf(obj)
    ) {
        metadata = Reflect.getMetadata(RPC_METADATA, obj);
        if (metadata)
            return metadata;
    }

    return {
        methods: {},
        options: {} as any,
    };
}
