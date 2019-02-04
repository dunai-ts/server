/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';
import { Request, Response, Router } from 'express';

/**
 * Type of route param. Used in param decorators in actions
 * @private
 */
export enum RouteParamType {
    Path = 'path',
    Query = 'query',
    Body = 'body'
}

/**
 * Route param details. Used in param decorators in actions
 * @private
 */
export interface IRouteParam {
    type: RouteParamType;
    key: string;
}

/**
 * Action metadata
 * @private
 */
export class ActionMeta {
    public methods: string[] = [];
    public path: string | RegExp = '/';
    public action: string = null;
    public params: IRouteParam[] = [];

    /**
     * Bind action to express
     * @param router
     * @param controller
     */
    public bind(router: Router, controller: Type<any> & ControllerMeta): void {
        // console.log(`Bind action "${this.methods} ${this.path}" to "${this.action}"`);

        if (this.methods.length) this.methods = ['all'];

        this.params = controller._route_params[this.action] || [];
        delete controller._route_params[this.action];

        const entities = controller._route_entity[this.action] || [];

        const handler = (req: Request, res: Response) => {
            const params: any[] = [req, res];

            this.params.forEach((param, index) => {
                switch (param.type) {
                    case RouteParamType.Path:
                        params[index] = param.key
                            ? req.params[param.key]
                            : req.params;
                        break;
                    case RouteParamType.Query:
                        params[index] = param.key
                            ? req.query[param.key]
                            : req.query;
                        break;
                    case RouteParamType.Body:
                        params[index] = param.key
                            ? req.body[param.key]
                            : req.body;
                        break;
                }
            });

            const prepare = [...params];
            entities.forEach((entity, index) => {
                if (typeof entity !== 'function') return;

                try {
                    // tslint:disable-next-line
                    if (typeof entity['findByPk'] === 'function')
                        prepare[index] = entity['findByPk'](params[index]);
                    else prepare[index] = entity(params[index]);
                } catch (error) {
                    prepare[index] = Promise.reject(error);
                }
            });

            Promise.all(prepare).then(
                resolved => controller[this.action](...resolved),
                (reject: Error | string) => {
                    if (params[0] === req) params[0] = '[request]';
                    if (params[1] === res) params[1] = '[response]';

                    let reason: Error = null;
                    if (typeof reject === 'object') reason = reject;
                    else
                        reason = {
                            name: 'Unknown',
                            message: reject
                        };

                    const error: EntityError = {
                        ...reason,
                        message: reason.message,
                        meta: this,
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
 * List of actions in controller metadata
 * @private
 */
export interface ControllerActions {
    [key: string]: ActionMeta;
}

/**
 * Type of Entity
 */
export type EntitySource = any;

/**
 * Controller metadata
 * @private
 */
export interface ControllerMeta {
    _routes: ControllerActions;
    _route_params: { [key: string]: IRouteParam[] };
    _route_entity: { [key: string]: EntitySource[] };
}

/**
 * Error on resolve entity
 */
export interface EntityError extends Error {
    meta: ActionMeta;
    params: any[];
}
