import { Injector, Service } from '@dunai/core';
import { rejects } from 'assert';
import express from 'express';
import { RequestHandlerParams } from 'express-serve-static-core';
import * as http from 'http';

import { ActionMeta } from './Router';

@Service()
export class HttpServer {
    /**
     * Get action list of controller
     * @param controller
     * @return {ActionMeta[]}
     */
    public static getControllerActions(controller: any): ActionMeta[] {
        if (typeof controller !== 'object')
            throw new Error('Api must be already initialized');

        if (!('_routes' in controller) || !Array.isArray(controller._routes)) {
            console.log(`${controller}`);
            throw new Error(`Api must decorated by @Controller`);
        }

        const actions: ActionMeta[] = controller._routes.map((item: any) => {
            if (item instanceof ActionMeta)
                return item;
            else
                throw new Error(`Action must be decorated by @Action`);
        });

        return actions;
    }

    public express: express.Application;
    public server: http.Server;

    constructor() {
        this.express = express();
    }

    /**
     * Listen port
     * @param {number} port
     * @param {string} hostname
     * @return {Promise<void>}
     */
    public listen(port: number, hostname: string = '0.0.0.0'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            //this.express.use((req, res, next) => {
            //    console.log(req.method, req.url);
            //    next();
            //});
            this.express.all('*', (req, res) => {
                res.status(404).send('Page not found.');
            });

            this.server = this.express.listen(port, hostname, resolve);

            this.server.addListener('error', (e: any) => {
                reject(e);
                this.server.removeListener('listening', resolve);
            });
            this.server.addListener('listening', () => {
                resolve();
                this.server.removeListener('error', reject);
            });
        });
    }

    /**
     * Use handler
     * @param {RequestHandlerParams} handlers
     * @return {e.Application}
     */
    public use(...handlers: RequestHandlerParams[]) {
        return this.express.use(...handlers);
    }

    /**
     * Close port
     */
    public close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server.addListener('error', (e: any) => {
                reject(e);
                this.server.removeListener('close', resolve);
            });
            this.server.addListener('close', () => {
                resolve();
                this.server.removeListener('error', reject);
            });
            this.server.close(resolve);
        });
    }

    /**
     * Register controller
     * @param {string | RegExp} url
     * @param controller Controller, decorated @Controller
     */
    public registerController(url: string | RegExp, controller: any): void {
        const ctrl = Injector.resolve<any>(controller);

        const actions = HttpServer.getControllerActions(ctrl);

        console.log(actions);

        if (!actions)
            return;

        const router = express.Router();
        console.log('Apply for ' + url);

        actions.forEach(action => action.bind(router, ctrl));

        this.express.use(url, router);
    }
}
