/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';
import { Router } from 'express';
import { EntityError } from '../Common';
import { checkController, ControllerMeta, EntitySource, IMethodParamDecoration } from '../controller/Common';
import { Request, Response } from '../Interfaces';
import { CONTROLLER_SESSION_PARAM } from '../session/Params';
import { ROUTE_BODY_PARAM, ROUTE_PATH_PARAM, ROUTE_QUERY_PARAM } from './Params';

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
    public methods: string[]                = [];
    public path: string | RegExp            = '/';
    public action: string                   = null;
    public params: IMethodParamDecoration[] = [];

    /**
     * Bind action to express
     * @param router
     * @param controller
     */
    public bind(router: Router, controller: Type<any> & RouteControllerMeta): void {
        // console.log(`Bind action "${this.methods} ${this.path}" to "${this.action}"`);

        if (this.methods.length) this.methods = ['all'];

        this.params = controller._route_params[this.action] || [];
        delete controller._route_params[this.action];

        const entities = controller._route_entity[this.action] || [];

        const handler = (req: Request, res: Response) => {
            Promise.all(prepare).then(
                resolved => controller[this.action](...resolved),
                (reject: Error | string) => {
                    if (params[0] === req) params[0] = '[request]';
                    if (params[1] === res) params[1] = '[response]';

                    let reason: Error = null;
                    if (typeof reject === 'object') reason = reject;
                    else
                        reason = {
                            name   : 'Unknown',
                            message: reject
                        };

                    const error: EntityError = {
                        ...reason,
                        message: reason.message,
                        meta   : this,
                        params
                    };
                    if (typeof controller['error'] === 'function') {
                        controller['error'](req, res, error);
                    } else res.status(404).json('Not found');
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
