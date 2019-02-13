/* tslint:disable */

import {  Injector } from '@dunai/core';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from './Application';
import { HttpServer } from './HttpServer';
import { Action, Controller } from './Router';
import url from 'url';
import { fetch } from './utils.spec';

@Application()
class App {
    constructor(public server?: HttpServer) {}

    public init(): void {
        this.server.registerController('/api', ApiController);
        this.server.registerController('/', DefaultController);
    }
}

@Controller('Ping controller')
class DefaultController {
    @Action('get', '/')
    public index(req: any) {
        const urlInfo = url.parse(req.originalUrl);

        return req.res.json({
            headers: req.headers,
            method: req.method,
            pathname: urlInfo.pathname,
            params: req.params,
            query: req.query,
            ping: 'ok'
        });
    }
}

@Controller('API controller')
class ApiController {
    @Action(['put', 'get'], '/:id')
    public index(req: any, res: any) {
        const urlInfo = url.parse(req.originalUrl);

        return res.json({
            headers: req.headers,
            method: req.method,
            pathname: urlInfo.pathname,
            params: req.params,
            query: req.query,
            api: 'ok'
        });
    }
}

describe('HttpServer service', () => {
    beforeEach(() => {
        Injector.reset();
    });

    describe('listen and close', () => {
        it('port', async () => {
            const app = createApp(App);

            await app.server.listen(3000);

            await app.server.close();

            await app.server.listen(3000);

            await app.server.close();
        });

        // it('port + hostname', () => {
        //    @Service()
        //    class MyService {}
        //
        //    const my: MyService = Injector.resolve<MyService>(MyService);
        //
        //    should(my).ok();
        //    should(my instanceof MyService).ok();
        // });
    });
    describe('registerController', () => {
        it('404', async () => {
            const app = createApp(App);
            app.init();

            await app.server.listen(3000);

            const result = await fetch(
                'get',
                'http://127.0.0.1:3000/asdaafsda'
            );
            should(result).eql({
                status: 404,
                body: 'Page not found.'
            });

            await app.server.close();
        });
        it('root', async () => {
            const app = createApp(App);
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/');
            should(result).eql({
                status: 200,
                body: {
                    headers: {
                        host: '127.0.0.1:3000',
                        'content-length': '0',
                        connection: 'close'
                    },
                    method: 'GET',
                    pathname: '/',
                    params: {},
                    query: {},
                    ping: 'ok'
                }
            });

            await app.server.close();
        });
        it('api with params and get', async () => {
            const app = createApp(App);
            app.init();

            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/api/a?asd=asd'
            );
            should(result).eql({
                status: 200,
                body: {
                    headers: {
                        host: '127.0.0.1:3000',
                        'content-length': '0',
                        connection: 'close'
                    },
                    method: 'PUT',
                    pathname: '/api/a',
                    params: {
                        id: 'a'
                    },
                    query: {
                        asd: 'asd'
                    },
                    api: 'ok'
                }
            });

            await app.server.close();
        });
    });
    describe('use handler', () => {});
});
