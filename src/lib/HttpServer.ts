import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { RequestHandlerParams } from 'express-serve-static-core';

import { Type } from './Common';
import { Injector } from './Injector';
import { Service } from './Service';
import { ActionMeta } from './Router';

@Service('HttpServer')
export class HttpServer {
    public express: express.Application;
    public server: http.Server;

    constructor() {
        this.express = express();
    }

    /**
     * Listen port
     * @param {number} port
     * @param {string} hostname
     * @param {number} backlog
     * @param {Function} callback
     * @return {"http".Server}
     */
    listen(port: number, hostname: string, backlog: number, callback?: Function): http.Server;
    listen(port: number, hostname: string, callback?: Function): http.Server;
    listen(port: number, callback?: Function): http.Server;
    listen(path: string, callback?: Function): http.Server;
    listen(handle: any, listeningListener?: Function): http.Server;
    listen(a, b?, c?, d?): http.Server {
        this.server = this.express.listen(a, b, c, d);
        return this.server;
    }

    /**
     * Use handler
     * @param {RequestHandlerParams} handlers
     * @return {e.Application}
     */
    use(...handlers: RequestHandlerParams[]) {
        return this.express.use(...handlers);
    }

    /**
     * Close port
     */
    close() {
        this.server.close();
    }

    /**
     * Register controller
     * @param {string | RegExp} url
     * @param controller Controller, decorated @Controller
     */
    registerController(url: string | RegExp, controller: any) {
        if (typeof controller === 'function')
            controller = Injector.resolve<any>(controller);

        const actions = HttpServer.getControllerActions(controller);

        if (!actions)
            return;

        const router = express.Router();
        actions.forEach(action => action.bind(router, controller));

        this.express.use(url, router);
    }

    /**
     * Get action list of controller
     * @param controller
     * @return {ActionMeta[]}
     */
    static getControllerActions(controller: any): ActionMeta[] {
        if (typeof controller !== 'object')
            throw new Error('Api must be already initialized');

        if (!('_routes' in controller) || !Array.isArray(controller._routes)) {
            console.log(`${controller}`);
            throw new Error(`Api must decorated by @Controller`);
        }

        const actions: ActionMeta[] = controller._routes.map(item => {
            if (item instanceof ActionMeta)
                return item;
            else
                throw new Error(`Action must be decorated by @Action`);
        });

        return actions;
    }
}