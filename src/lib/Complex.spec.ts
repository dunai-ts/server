/* tslint:disable */

import { Application, Injector } from '@dunai/core';
import { describe, it } from 'mocha';
//import * as request from 'request';
import should from 'should';
import { HttpServer } from './HttpServer';
import { Action, Controller } from './Router';
import request = require('request');

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
    public index(req: any, res: any) {
        return res.json({
            ping: 'ok'
        });
    }
}

@Controller('API controller')
class ApiController {
    @Action(['put', 'get'], '/:id')
    public index(req: any, res: any) {
        return res.json({
            api: 'ok'
        });
    }
}

/* tslint:disable */
function fetch(method: string, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        request({
            url,
            method
        }, (error: any, _: any, body: any) => {
            console.log(error, body);
            return error ? reject(error) : resolve(body);
        });
    });
}

describe('HttpServer service', () => {
    beforeEach(() => {
        Injector.reset();
    });

    describe('listen and close', () => {
        it('port', async () => {
            const app = new App();

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
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/asdaafsda');
            should(result).equal('Page not found.');

            await app.server.close();
        });
        it('root', async () => {
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/');
            should(result).equal('{"ping":"ok"}');

            await app.server.close();
        });
        it('api with params and get', async () => {
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/api/a?asd=asd');
            should(result).equal('{"api":"ok"}');

            await app.server.close();
        });
    });
    describe('use handler', () => {});
});
