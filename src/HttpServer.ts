/**
 * @module @dunai/server
 */

import { deepFreeze, Injector, Service, Type } from '@dunai/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as http from 'http';
import * as Url from 'url';
import { Request, Response } from './Interfaces';
import { RouteMeta } from './router/Common';
import { ISessionStorage, SessionData } from './session/Session';
import { IWebSocketClientFactory, WebSocketEndpoint } from './ws';

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
                `Error in controller "${controller.constructor.toString()}"`
            );
            throw new Error(`Controller must be decorated by @Controller\n  and must contain at least one action`);
        }

        const actions: RouteMeta[] = Object.keys(controller._routes).map(i => {
            const item = controller._routes[i];
            if (item instanceof RouteMeta)
                return item;
            else
                throw new Error(`Route must be decorated by @Route`);
        });

        return actions;
    }

    public express: express.Application;
    public server: http.Server;
    public sessionStorage: ISessionStorage;
    public servedWebSockets: {
        [key: string]: WebSocketEndpoint;
    } = {};

    constructor() {
        this.server = http.createServer();
        this.express = express();
        this.server.on('request', this.express);
        this.express.use(cookieParser());
    }

    public setSessionStorage(sessionKey: any, // (req: express.Request, res: express.Response, next: () => void) => void,
                             storage: Type<ISessionStorage>) {
        if (this.sessionStorage)
            throw new Error('Session storage already exists');
        if (Array.isArray(sessionKey))
            this.express.use(...sessionKey);
        else
            this.express.use(sessionKey);

        const sessionStorage = Injector.resolve<ISessionStorage>(storage);
        this.sessionStorage = sessionStorage;
        this.express.use((req: Request, res: Response, next: () => void) => {
            const data = sessionStorage.get(req.session_id);
            req.session = deepFreeze(data);
            res.session = new SessionData(req.session);
            res.on('finish', () => {
                sessionStorage.set(req.session_id, res.session.getData(), data);
            });
            next();
        });
    }

    /**
     * TODO refactoring, tests
     * @param options
     */
    public webSocket(factory: IWebSocketClientFactory): WebSocketEndpoint;
    public webSocket(path: string, factory: IWebSocketClientFactory): WebSocketEndpoint;
    public webSocket(path?: string | IWebSocketClientFactory, factory?: IWebSocketClientFactory): WebSocketEndpoint {
        if (typeof path === 'string')
            return this.servedWebSockets[path] = new WebSocketEndpoint(factory);
        else
            return this.servedWebSockets['/'] = new WebSocketEndpoint(path);
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
                    message: 'Not Found'
                });
            });

            this.server.on('upgrade', (request, socket, head) => {
                const pathname = Url.parse(request.url).pathname;

                if (pathname in this.servedWebSockets) {
                    const ws = this.servedWebSockets[pathname];
                    ws.handleUpgrade(request, socket, head, (client) => {
                        ws.emit('connection', client, request);
                    });
                } else {
                    socket.destroy();
                }
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
        const ctrl = Injector.resolve<any>(controller);

        const actions = HttpServer.getControllerRoutes(ctrl);

        if (!actions) return;

        const router = express.Router();

        actions.forEach(action => action.bind(router, ctrl));

        this.express.use(url, router);
    }
}
