/**
 * @module @dunai/server
 */

import { Injector, Service } from '@dunai/core';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as http from 'http';
import { RouteMeta } from './router';

/**
 * HTTP server (bases on express.js)
 * @public
 */
@Service()
export class HttpServer {
    /**
     * Get action list of controller
     * @param controller
     * @return {RouteMeta[]}
     */
    public static getControllerRoutes(controller: any): RouteMeta[] {
        if (typeof controller !== 'object')
            throw new Error('Api must be already initialized');

        if (
            !('_routes' in controller) ||
            typeof controller._routes !== 'object'
        ) {
            console.log(
                `Error in controller "${controller.constructor.toString()}"`,
            );
            throw new Error(`Controller must be decorated by @Controller\n  and must contain at least one action`);
        }

        return Object.keys(controller._routes).map(i => {
            const item = controller._routes[i];
            if (item instanceof RouteMeta)
                return item;
            else
                throw new Error(`Route must be decorated by @Route`);
        });
    }

    public express: express.Application;
    public server: http.Server;

    constructor() {
        this.server = http.createServer();
        this.express = express();
        this.server.on('request', this.express);
        this.express.use(cookieParser());
        this.express.use(bodyParser.json());
    }

    /**
     * Listen port
     * TODO refactoring, tests
     * @param {number} port
     * @param {string} hostname
     * @return {Promise<void>}
     */
    public listen(port: number, hostname: string = '0.0.0.0'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.express.all('*', (req, res) => {
                res.status(404).send({
                    code   : -32601,
                    message: 'Not Found',
                });
            });

            this.server.listen(port, hostname, resolve);

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
    public use(...handlers: any[]): express.Application {
        return this.express.use(...handlers);
    }

    /**
     * Close port
     */
    public close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.server)
                return resolve();
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
        let ctrl: any;
        try {
            ctrl = Injector.resolve<any>(controller);
        } catch (error) {
            if (error.message === 'target is not a constructor')
                ctrl = controller;
            else
                throw error;
        }

        const actions = HttpServer.getControllerRoutes(ctrl);

        if (!actions) return;

        const router = express.Router();

        actions.forEach(action => action.bind(router, ctrl));

        this.express.use(url, router);
    }
}
