/**
 * @module @dunai/server
 */

const CONTROLLER_META_KEY = 'dunai:controller';

import { Type } from '@dunai/core';
// import { Reflect } from 'reflect-metadata';
import 'reflect-metadata';
import { Request } from './Interfaces';

export interface IDecoratedParamResolveData {
    http?: Request;
    ws?: any;
    [key: string]: any;
}

export type IDecoratedParamResolveFunction = (data: IDecoratedParamResolveData, value?: any) => any;

export interface IDecoratedParamDecoration {
    type: string;
    useFunction?: IDecoratedParamResolveFunction;
    useClass?: IDecoratedParamResolver;
}

export interface IDecoratedParamResolver {
    resolveParam: IDecoratedParamResolveFunction;
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

    meta.preparedMethods[method] = meta.methodParams[method].map(param => {
        return param.map(item => {
            return item.useFunction;
        });
    });

    return meta.preparedMethods[method];
}

export function runMethod(controller: any, method: string) {
    const params = prepareMethod(controller, method);

    return (data: IDecoratedParamResolveData, ...rest: any[]): any => {
        while (rest.length > params.length)
            params.push([]);
        const values = [];
        for (let index = 0; index < params.length; index++) {
            const items = params[index] || [];
            values.push(items.reduce((value, func) => func(data, value), rest[index]));
        }
        return controller[method](...values);
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
