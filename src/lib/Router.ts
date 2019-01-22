import 'reflect-metadata';
import * as express from 'express';
import { Injector } from './Injector';

export function getRoutes(controller: any) {
    let routes = [];
    return controller['_routes'];//Reflect.getMetadata('meta', controller);
}

export class ActionMeta {
    methods: string[]     = [];
    path: string | RegExp = '/';
    action: string        = null;

    bind(router: express.Router, controller: any) {
//        console.log(`Bind ${this.methods} ${this.path} to ${this.action}`);
        if (this.methods.length)
            this.methods.forEach(method => router[method](this.path, (req, res) => controller[this.action](req, res)));
        else
            router.all(this.path, (req, res) => controller[this.action](req, res));
    }
}

export class ControllerMeta {
    routes: ActionMeta[] = [];
}

export function Controller(name: string = '') {
    return (target: any) => {
//        console.log(`@Controller ${name}`);
        Injector.registerService(target);
    };
}

export function Action(path: string | RegExp);
export function Action(method: string, path: string | RegExp);
export function Action(methods: string[], path: string | RegExp);
export function Action(methods: any, path?: any) {
    if (path === void 0) {
        path    = methods;
        methods = [];
    }

    if (!Array.isArray(methods))
        methods = [methods];

    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> => {
//        console.log('New @Action', methods, path, propertyKey);

        if (!target['_routes']) {
            target['_routes'] = [];
        }

        const availableMethods = [
            'all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head',

            'checkout', 'connect', 'copy', 'lock', 'merge', 'mkactivity', 'mkcol',
            'move', 'm-search', 'notify', 'propfind', 'proppatch', 'purge',
            'report', 'search', 'subscribe', 'trace', 'unlock', 'unsubscribe',
        ];

        let action: ActionMeta = new ActionMeta();
        action.methods         = methods.filter(method => availableMethods.indexOf(method) !== -1);
        action.path            = path;
        action.action          = propertyKey;
        (target['_routes'] as ActionMeta[]).push(action);

        return descriptor;
    };
}