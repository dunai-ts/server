/**
 * @module @dunai/server
 */

import { GenericClassDecorator, Injector, Type } from '@dunai/core';

/**
 * Decorate class as controller
 * @decorator
 * @param name
 */
export function Controller(
    name: string = ''
): GenericClassDecorator<Type<any>> {
    // console.log(`Register controller "${name}"`);
    return (target: any) => {
        Injector.registerService(target);
    };
}
