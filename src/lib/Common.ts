import { Type } from '@dunai/core';
import { Request, Response, Router } from 'express';

export enum RouteParamType {
    Path = 'path',
    Query = 'query',
    Body = 'body',
}

export interface IRouteParam {
    type: RouteParamType;
    key: string;
}

export class ActionMeta {
    public methods: string[] = [];
    public path: string | RegExp = '/';
    public action: string = null;
    public params: IRouteParam[] = [];

    public bind(router: Router, controller: Type<any> & ControllerMeta): void {
        // console.log(`Bind action "${this.methods} ${this.path}" to "${this.action}"`);

        if (this.methods.length)
            this.methods = ['all'];

        this.params = controller._route_params[this.action] || [];
        delete controller._route_params[this.action];

        const entities = controller._route_entity[this.action] || [];

        const handler = (req: Request, res: Response) => {
            const params: any[] = [req, res];

            this.params.forEach((param, index) => {
                switch (param.type) {
                    case RouteParamType.Path:
                        params[index] = param.key ? req.params[param.key] : req.params;
                        break;
                    case RouteParamType.Query:
                        params[index] = param.key ? req.query[param.key] : req.query;
                        break;
                    case RouteParamType.Body:
                        params[index] = param.key ? req.body[param.key] : req.body;
                        break;
                    default:
                        throw new Error('Not implements');
                }
            });

            const prepare = [...params];
            entities.forEach((entity, index) => {
                if (typeof entity !== 'function')
                    return;

                if (typeof entity['findByPk'])
                    prepare[index] = entity['findByPk'](params[index]);
            });

            Promise.all(prepare).then(
                resolved => controller[this.action](...resolved),
                (reject: Error | string) => {
                    if (params[0] === req) params[0] = '[request]';
                    if (params[1] === res) params[1] = '[response]';

                    let reason: Error = null;
                    if (typeof reject === 'object')
                        reason = reject;
                    else
                        reason = {
                            name   : 'Unknown',
                            message: reject,
                        };

                    const error: EntityError = {
                        ...reason,
                        meta: this,
                        params
                    };
                    if (typeof controller['error'] === 'function') {
                        controller['error'](req, res, error);
                    } else
                        res.status(404).json('Not found');
                }
            );
        };

        this.methods.forEach(method => router[method](this.path, handler));
    }
}

export interface ControllerActions {
    [key: string]: ActionMeta;
}

export type EntitySource = any;

export interface ControllerMeta {
    _routes: ControllerActions;
    _route_params: { [key: string]: IRouteParam[] };
    _route_entity: { [key: string]: EntitySource[] };
}

export interface EntityError extends Error {
    meta: ActionMeta;
    params: any[];
}
