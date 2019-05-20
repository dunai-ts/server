/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';
import 'reflect-metadata';
import { checkRouteController, RouteMeta } from './Common';

// /**
// * @private
// * @param controller
// */
// export function getRoutes(controller: any) {
//    //const routes = [];
//    return controller['_routes']; //Reflect.getMetadata('meta', controller);
// }

/**
 * Decorate method as action in controller
 * You must use @Route instead @Action
 * @decorator Make action
 * @param path
 * @return {function}
 * @deprecated
 */
export function Action(path: string | RegExp);
export function Action(method: string | string[], path: string | RegExp);
export function Action(methods: any, path?: any) {
    return Route(methods, path);
}

/**
 * Decorate method as action in controller
 * @decorator Make action
 * @param path
 * @return {function}
 */
export function Route(path: string | RegExp);
export function Route(method: string | string[], path: string | RegExp);
export function Route(methods: any, path?: any) {
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
        const target = checkRouteController(controller);

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

        const routeMeta: RouteMeta  = new RouteMeta();
        routeMeta.methods           = methods.filter(
            (method: string) => availableMethods.indexOf(method) !== -1
        );
        routeMeta.path              = path;
        routeMeta.action            = propertyKey;
        target._routes[propertyKey] = routeMeta;

        return descriptor;
    };
}
