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

        const handler = (req: Request, res: Response) => {
            const params: any[] = [req, res];

            this.params.forEach((param, index) => {
                switch (param.type) {
                    case RouteParamType.Path:
                        params[index] = req.params[param.key];
                        break;
                    case RouteParamType.Query:
                        params[index] = req.query[param.key];
                        break;
                    case RouteParamType.Body:
                        params[index] = param.key ? req.body[param.key] : req.body;
                        break;
                    default:
                        throw new Error('Not implements');
                }
            });

            controller[this.action](...params);
        };

        this.methods.forEach(method => router[method](this.path, handler));
    }
}

export interface ControllerActions {
    [key: string]: ActionMeta;
}

export interface ControllerMeta {
    _routes: ControllerActions;
    _route_params: { [key: string]: IRouteParam[] };
}
