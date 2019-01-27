/* tslint:disable */
import 'reflect-metadata';
import { GenericClassDecorator, Injector, Type } from '@dunai/core';
import express from 'express';

export function getRoutes(controller: any) {
    //const routes = [];
    return controller['_routes'];//Reflect.getMetadata('meta', controller);
}

export class ActionMeta {
    public methods: string[]     = [];
    public path: string | RegExp = '/';
    public action: string        = null;
    public bind(router: any, controller: any) {
        //public bind(router: express.Router, controller: any) {
        console.log(`Bind ${this.methods} ${this.path} to ${this.action}`);
        if (this.methods.length)
            this.methods.forEach(method => router[method](this.path, (req: any, res: any) => controller[this.action](req, res)));
        else
            router.all(this.path, (req: any, res: any) => controller[this.action](req, res));
    }
}

export class ControllerMeta {
    public routes: ActionMeta[] = [];
}

export const Controller = (name: string = ''): GenericClassDecorator<Type<any>> => {
    console.log(`Register controller "${name}"`);
    return (target: any) => {
        Injector.registerService(target);
    };
};

//export function Action(path: string | RegExp);
//export function Action(method: string, path: string | RegExp);
//export function Action(methods: string[], path: string | RegExp);
export function Action(methods: any, path?: any) {
    if (path === void 0) {
        path    = methods;
        methods = [];
    }

    if (!Array.isArray(methods))
        methods = [methods];

    return (target: any /*object*/, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> => {
//        console.log('New @Action', methods, path, propertyKey);

        if (!target['_routes']) {
            target['_routes'] = [];
        }

        const availableMethods = [
            'all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head',

            'checkout', 'connect', 'copy', 'lock', 'merge', 'mkactivity', 'mkcol',
            'move', 'm-search', 'notify', 'propfind', 'proppatch', 'purge',
            'report', 'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'
        ];

        const action: ActionMeta = new ActionMeta();
        action.methods           = methods.filter((method: string) => availableMethods.indexOf(method) !== -1);
        action.path              = path;
        action.action            = propertyKey;
        (target['_routes'] as ActionMeta[]).push(action);

        return descriptor;
    };
}
