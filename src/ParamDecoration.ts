/**
 * @module @dunai/server
 */

import { Injector, Type } from '@dunai/core';
import 'reflect-metadata';

const CONTROLLER_META_KEY = 'dunai:controller';

export type IDecoratedParamResolveData = any;

export type IDecoratedParamResolveFunction = (data: IDecoratedParamResolveData, value?: any) => any;

export interface IDecoratedParamResolver {
    resolveParam(data: IDecoratedParamResolveData, value?: any): any;
}

export interface IDecoratedParamDecoration {
    type: string;
    useFunction?: IDecoratedParamResolveFunction;
    useInstance?: IDecoratedParamResolver;
    useFactory?: (controller?: any, method?: string, index?: number) => IDecoratedParamResolveFunction;
    useClass?: Type<IDecoratedParamResolver>;
}

/**
 * Base function for param decorators
 * @private
 * @param type
 * @param key
 */
export function addControllerParamDecoration(decoration: IDecoratedParamDecoration) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const meta = getControllerMetadata(controller);

        if (!meta.methodParams[propertyKey])
            meta.methodParams[propertyKey] = [];

        if (!meta.methodParams[propertyKey][index])
            meta.methodParams[propertyKey][index] = [];

        meta.methodParams[propertyKey][index].push(decoration);
    };
}

export function prepareAllMethods(controller: Type<any>): string[] {
    return Object.keys(controller).filter(method => prepareMethod(controller, method));
}

export function prepareMethod(controller: Type<any>, method: string): IDecoratedParamResolveFunction[][] {
    const meta = getControllerMetadata(controller);
    if (meta.preparedMethods) {
        if (meta.preparedMethods[method])
            return meta.preparedMethods[method];
    } else
        meta.preparedMethods = {};

    if (!meta.methodParams[method]) {
        if (typeof controller[method] !== 'function')
            throw new Error(`Cannot prepare controller method "${method}" for ${controller.name || controller} controller`);

        meta.preparedMethods[method] = [];
        return [];
    }

    meta.preparedMethods[method] = meta.methodParams[method].map((param, index) => {
        return param.map(item => {
            if (item.useFunction)
                return item.useFunction;
            if (item.useClass) {
                const instance: IDecoratedParamResolver = Injector.resolve(item.useClass);
                return instance.resolveParam.bind(instance);
            }
            if (item.useInstance) {
                return item.useInstance.resolveParam.bind(item.useInstance);
            }
            if (item.useFactory) {
                return item.useFactory(controller, method, index);
            }
            throw new Error(`Invalid param decorator in class "${controller.constructor.name}" method "${method}"`);
        });
    });

    return meta.preparedMethods[method];
}

export function runMethod<T>(controller: any, method: string) {
    const params = prepareMethod(controller, method);

    return (data: IDecoratedParamResolveData, ...rest: any[]): Promise<T> => {
        while (rest.length > params.length)
            params.push([]);
        const values = [];
        for (let index = 0; index < params.length; index++) {
            const items = params[index] || [];
            values.push(
                items.reduce(
                    (value, func) => value.then(val => func(data, val)),
                    new Promise(resolve => resolve(rest[index]))
                )
            );
        }

        return Promise.all(values)
            .then(
                resolved => controller[method](...resolved)
            );
    };
}

/**
 * Check controller for hidden parameters
 *
 * If parameter not exists - make it
 * @private
 * @param target
 */
export function getControllerMetadata(target: Type<any>): ControllerMeta {
    const proto = target;
    if (Reflect.hasMetadata(CONTROLLER_META_KEY, proto)) {
        return Reflect.getMetadata(CONTROLLER_META_KEY, proto) as ControllerMeta;
    } else {
        const meta: ControllerMeta = {
            methodParams   : {},
            preparedMethods: null
        };
        Reflect.defineMetadata(CONTROLLER_META_KEY, meta, proto);
        return meta;
    }
}

/**
 * Controller metadata
 * @private
 */
export interface ControllerMeta {
    methodParams: { [key: string]: IDecoratedParamDecoration[][] };
    preparedMethods: { [key: string]: IDecoratedParamResolveFunction[][] }
}
