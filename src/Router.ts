/**
 * @module @dunai/server
 */
import { GenericClassDecorator, Injector, Type } from '@dunai/core';
import 'reflect-metadata';
import { ActionMeta, ControllerMeta, EntitySource, RouteParamType } from './Common';

// /**
// * @private
// * @param controller
// */
// export function getRoutes(controller: any) {
//    //const routes = [];
//    return controller['_actions']; //Reflect.getMetadata('meta', controller);
// }

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

/**
 * Decorate method as action in controller
 * @decorator Make action
 * @param path
 * @return {function}
 */
export function Action(path: string | RegExp);
export function Action(method: string | string[], path: string | RegExp);
export function Action(methods: any, path?: any) {
    /* tslint:disable:no-parameter-reassignment */
    if (path === void 0) {
        path    = methods;
        methods = [];
    }

    if (!Array.isArray(methods)) methods = [methods];

    methods = methods.map(m => m.toLowerCase());
    /* tslint:enable */

    return (
        controller: Type<any>,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>
    ): TypedPropertyDescriptor<any> => {
        const target = checkController(controller);

        const availableMethods = [
            'all',
            'get',
            'post',
            'put',
            'delete',
            'patch',
            'options',
            'head',

            'checkout',
            'connect',
            'copy',
            'lock',
            'merge',
            'mkactivity',
            'mkcol',
            'move',
            'm-search',
            'notify',
            'propfind',
            'proppatch',
            'purge',
            'report',
            'search',
            'subscribe',
            'trace',
            'unlock',
            'unsubscribe'
        ];

        const action: ActionMeta       = new ActionMeta();
        action.methods                 = methods.filter(
            (method: string) => availableMethods.indexOf(method) !== -1
        );
        action.path                    = path;
        action.action                  = propertyKey;
        target['_actions'][propertyKey] = action;

        return descriptor;
    };
}

/**
 * Base function for param decorators
 * @private
 * @param type
 * @param key
 */
function addRouteParam(type: RouteParamType, params: {[key:string]: any}) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const target = checkController(controller);

        if (!(propertyKey in target._action_params))
            target._action_params[propertyKey] = [];

        if (!(propertyKey in target._action_params[index]))
            target._action_params[propertyKey][index] = [];

        target._action_params[propertyKey][index].push({
            type,
            params
        });
    };
}

/**
 * Resolve entity by parameter
 * @param entity
 * @decorator
 */
export function Entity(entity: EntitySource) {
    return addRouteParam(RouteParamType.Entity, {entity})
    // return (controller: Type<any>, propertyKey: string, index: number) => {
    //     const target = checkController(controller);
    //
    //     if (!(propertyKey in target._route_entity))
    //         target._route_entity[propertyKey] = [];
    //
    //     target._route_entity[propertyKey][index] = entity;
    // };
}

/**
 * Get parameter from path
 *
 * If call without parameters return all path parameters
 * @param key
 * @decorator
 */
export function Path(key?: string) {
    return addRouteParam(RouteParamType.Path, {key});
}

/**
 * Get parameter from query
 *
 * If call without parameters return all query parameters
 * @param key
 * @decorator
 */
export function Query(key?: string) {
    return addRouteParam(RouteParamType.Query, {key});
}

/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Body(key?: string) {
    return addRouteParam(RouteParamType.Body, {key});
}

/**
 * Get parameter from body
 *
 * If call without parameters return all body parameters
 * @param key
 * @decorator
 */
export function Session(key?: string) {
    return addRouteParam(RouteParamType.Session, {key});
}

/**
 * Check controller for hidden parameters
 *
 * If parameter not exists - make it
 * @private
 * @param target
 */
function checkController<T>(target: Type<T>): Type<T> & ControllerMeta {
    if (!target['_actions']) target['_actions'] = {};

    if (!target['_action_params']) target['_action_params'] = {};

    return target as any;
}
