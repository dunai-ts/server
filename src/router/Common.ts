/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';
import { runMethod } from '@dunai/core';
import { Router } from 'express';
import { checkController, ControllerMeta, EntitySource, IMethodParamDecoration } from '../controller/Common';
import { Request, Response } from '../Interfaces';
import { HttpError, InternalServerError } from './Errors';

/**
 * List of actions in controller metadata
 * @private
 *
 * TODO rename to ControllerRoutes
 */
export interface ControllerRoutes {
    [key: string]: RouteMeta;
}

export interface IDecoratedParamHttpResolveData {
    http?: Request;
    ws?: any;
    [key: string]: any;
}

/**
 * Route controller metadata
 * @private
 */
export interface RouteControllerMeta extends ControllerMeta {
    _routes: ControllerRoutes;
    _route_params: { [key: string]: IMethodParamDecoration[] };
    _route_entity: { [key: string]: EntitySource[] };
}

/**
 * Route metadata
 * @private
 */
export class RouteMeta {
    public methods: string[] = [];
    public path: string | RegExp = '/';
    public action: string = null;
    public params: IMethodParamDecoration[] = [];

    /**
     * Bind action to express
     * @param router
     * @param controller
     */
    public bind(router: Router, controller: Type<any> & RouteControllerMeta): void {
        // console.log(`Bind action "${this.methods} ${this.path}" to "${this.action}"`);

        if (!this.methods.length) this.methods = ['all'];

        const handler = (req: Request, res: Response) => {
            const data: IDecoratedParamHttpResolveData = {
                http: req
            };
            runMethod(controller, this.action)(data, req, res).then(
                result => {
                    if (result && result !== res)
                        res.json(result);
                },
                error => {
                    let httpError: HttpError;
                    if (error instanceof HttpError) {
                        httpError = error;
                    } else {
                        const details = {
                            stack: ('' + error.stack).split('\n')
                                                     .slice(1)
                                                     .map(line => {
                                                         const match: RegExpMatchArray = line.match(/^\s+at\s([\w\.]+).*:(\d+):\d+\)/);
                                                         if (match && match.length > 2)
                                                             return match[1] + ':' + match[2];
                                                         else
                                                             return line;
                                                     })
                        };

                        httpError = new InternalServerError('' + error, -32603, details);
                    }

                    res.status(httpError.statusCode)
                       .json({
                           code   : httpError.code,
                           message: httpError.message,
                           details: httpError.details
                       });

                }
            );
        };

        this.methods.forEach(method => router[method](this.path, handler));
    }
}

/**
 * Check route controller for hidden parameters
 *
 * If parameter not exists - make it
 * @private
 * @param target
 */
export function checkRouteController<T>(target: Type<T>): Type<T> & RouteControllerMeta {
    const ctrl = checkController(target);
    if (!ctrl['_routes']) ctrl['_routes'] = {};
    return ctrl as any;
}
