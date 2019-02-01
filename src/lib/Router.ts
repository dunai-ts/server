/* tslint:disable */
import 'reflect-metadata';
import { GenericClassDecorator, Injector, Type } from '@dunai/core';
import { ActionMeta, ControllerMeta, EntitySource, IRouteParam, RouteParamType } from './Common';

export function getRoutes(controller: any) {
    //const routes = [];
    return controller['_routes'];//Reflect.getMetadata('meta', controller);
}

export const Controller = (name: string = ''): GenericClassDecorator<Type<any>> => {
    console.log(`Register controller "${name}"`);
    return (target: any) => {
        Injector.registerService(target);
    };
};

export function Action(path: string | RegExp);
export function Action(method: string, path: string | RegExp);
export function Action(methods: string[], path: string | RegExp);
export function Action(methods: any, path?: any) {
    if (path === void 0) {
        path = methods;
        methods = [];
    }

    if (!Array.isArray(methods))
        methods = [methods];

    methods = methods.map(m => m.toLowerCase());

    return (controller: Type<any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> => {
        const target = checkController(controller);

        console.log('New @Action', target, methods, path, propertyKey);

        const availableMethods = [
            'all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head',

            'checkout', 'connect', 'copy', 'lock', 'merge', 'mkactivity', 'mkcol',
            'move', 'm-search', 'notify', 'propfind', 'proppatch', 'purge',
            'report', 'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'
        ];

        const action: ActionMeta = new ActionMeta();
        action.methods = methods.filter((method: string) => availableMethods.indexOf(method) !== -1);
        action.path = path;
        action.action = propertyKey;
        target['_routes'][propertyKey] = action;

        return descriptor;
    };
}

export function Entity(entity: EntitySource) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const target = checkController(controller);

        if (!(propertyKey in target._route_entity))
            target._route_entity[propertyKey] = [];

        target._route_entity[propertyKey][index] = entity;
    };
}

function addRouteParam(type: RouteParamType, key: string) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const target = checkController(controller);

        if (!(propertyKey in target._route_params))
            target._route_params[propertyKey] = [];

        target._route_params[propertyKey][index] = {
            type, key
        };
    };
}

export function Path(key?: string) {
    return addRouteParam(RouteParamType.Path, key);
}

export function Query(key?: string) {
    return addRouteParam(RouteParamType.Query, key);
}

export function Body(key?: string) {
    return addRouteParam(RouteParamType.Body, key);
}

function checkController<T>(target: Type<T>): Type<T> & ControllerMeta {
    if (!target['_routes'])
        target['_routes'] = {};

    if (!target['_route_params'])
        target['_route_params'] = {};

    if (!target['_route_entity'])
        target['_route_entity'] = {};

    return target as any;
}

/*
let data = {
    ada    : 'asdasdasdasd',
    asdsgdf: '65uyhtfhg'
};

class FFF {
    public dfg = {
        dfgd: 'asdafgasd',
        tf  : 'sdfsd'
    };

    get index() {
        return data;
    }
}

function FFF1(data: any) {
    this.dfg = {
        dfgd: 'asdafgasd',
        tf  : 'sdfsd'
    };
    Object.defineProperty(this, 'index', {
        get(): any {
            return data;
        }
    });
}

const gg = new FFF;

console.log(gg);
console.log(JSON.stringify(gg, null, 2));

const gg1 = new FFF1(data);

console.log(gg1);
console.log(JSON.stringify(gg1, null, 2));

 */
