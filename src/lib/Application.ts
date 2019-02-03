/**
 * @module @dunai/server
 */
import { Injector, Type } from '@dunai/core';

/**
 * Decorate class as application
 * @decorator
 */
export function Application(): (target: any) => any {
    return (target: any): any => {
        Injector.registerService(target);
        return target;
    };
}

export function createApp<T>(application: Type<T>, ...params: any[]): T {
    return Injector.create<T>(application, ...params);
}
