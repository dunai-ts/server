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
 * @param name
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

/**
 * Get all methods and property name from object and all prototypes
 * @param object
 * @return method - key map
 */
function getMethods(instance: any): { [method: string]: string } {
    const keys = {};
    let obj = instance;
    do {
        Object.getOwnPropertyNames(obj).map(key => {
            const method: string = Reflect.getMetadata('method', obj, key);
            if (method && !keys[key])
                keys[key] = method;
        });
        // tslint:disable-next-line
    } while ((obj = Object.getPrototypeOf(obj)));

    const methods: any = {};
    Object.keys(keys).forEach(key => {
        if (Array.isArray(keys[key]))
            keys[key].forEach(item => methods[item] = key);
        else
            methods[keys[key]] = key;
    });
    return methods;
}
