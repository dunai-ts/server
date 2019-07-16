import { Type } from '@dunai/core';

/**
 * @module @dunai/server
 */

/**
 * TODO Method as method parameter ? whats return method name
 * @param method
 * @constructor
 */
export function Method(method: string | string[]) {
    return (
        controller: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>,
    ): TypedPropertyDescriptor<any> => {
        Reflect.defineMetadata('method', method, controller, propertyKey);
        return descriptor;
    };
}
