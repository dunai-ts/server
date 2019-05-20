/**
 * @module @dunai/server
 */

import { Type } from '@dunai/core';

/**
 * Route param details. Used in param decorators in actions
 * @private
 */
export interface IMethodParamDecoration {
    type: string;
    key: string;
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
    // _routes: ControllerRoutes;
    _route_params: { [key: string]: IMethodParamDecoration[] };
    _route_entity: { [key: string]: EntitySource[] };
}

/**
 * Check controller for hidden parameters
 *
 * If parameter not exists - make it
 * @private
 * @param target
 */
export function checkController<T>(target: Type<T>): Type<T> & ControllerMeta {
    const ctrl = target as Type<T> & ControllerMeta;
    if (!ctrl._route_params) ctrl._route_params = {};

    if (!ctrl._route_entity) ctrl._route_entity = {};

    return ctrl;
}
